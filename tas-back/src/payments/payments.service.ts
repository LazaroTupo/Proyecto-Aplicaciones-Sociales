import { Injectable, BadRequestException, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { CreatePledgeDto } from './dto/create-pledge.dto';
import { Pledge, PledgeStatus } from './entities/pledge.entity';
import { Project, ProjectStatus } from '../projects/entities/project.entity';
import { Reward } from '../projects/entities/reward.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly paypalApiUrl: string;

  constructor(
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.paypalApiUrl = this.configService.get<string>('PAYPAL_API_URL') || 'https://api-m.sandbox.paypal.com';
  }

  private async getPayPalAccessToken(): Promise<string> {
     const clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
     const secret = this.configService.get<string>('PAYPAL_SECRET');
     
     if (!clientId || !secret) {
        this.logger.warn('Faltan credenciales de PayPal. Usando token mock.');
        return 'mock_token';
     }

     const auth = Buffer.from(`${clientId}:${secret}`).toString('base64');
     try {
       const response = await lastValueFrom(
         this.httpService.post(
           `${this.paypalApiUrl}/v1/oauth2/token`,
           'grant_type=client_credentials',
           {
             headers: {
               Authorization: `Basic ${auth}`,
               'Content-Type': 'application/x-www-form-urlencoded',
             },
           },
         ),
       );
       return response.data.access_token;
     } catch (error) {
       this.logger.error('Error obteniendo token de PayPal', error);
       throw new InternalServerErrorException('Error con la pasarela de pagos');
     }
  }

  async createPledge(projectId: string, userId: string, dto: CreatePledgeDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const project = await queryRunner.manager.findOne(Project, {
        where: { id: projectId },
      });

      if (!project) throw new BadRequestException('Project not found');
      if (project.status !== ProjectStatus.FUNDING) throw new BadRequestException('Project is not currently accepting pledges');

      let reward: Reward | null = null;
      if (dto.rewardId) {
        reward = await queryRunner.manager.findOne(Reward, {
          where: { id: dto.rewardId, project: { id: projectId } },
        });
        if (!reward) throw new BadRequestException('Reward not found for this project');
        if (dto.amount < reward.amount) throw new BadRequestException('Amount is less than the reward minimum');
      }

      // 1. Crear Orden en PayPal
      const token = await this.getPayPalAccessToken();
      let paypalOrderId = `mock_order_${Date.now()}`;
      let approvalUrl = `https://mock-paypal.com/checkout?token=${paypalOrderId}`;

      if (token !== 'mock_token') {
        const orderPayload = {
          intent: 'CAPTURE',
          purchase_units: [
            {
              amount: {
                currency_code: 'USD',
                value: dto.amount.toString(),
              },
            },
          ],
        };

        const response = await lastValueFrom(
          this.httpService.post(`${this.paypalApiUrl}/v2/checkout/orders`, orderPayload, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        );

        paypalOrderId = response.data.id;
        const approveLink = response.data.links.find((link: any) => link.rel === 'approve');
        approvalUrl = approveLink ? approveLink.href : '';
      }

      // 2. Guardar en Base de Datos como PENDING
      const pledge = queryRunner.manager.create(Pledge, {
        amount: dto.amount,
        status: PledgeStatus.PENDING,
        paypalOrderId: paypalOrderId,
        project: { id: projectId },
        user: { id: userId },
        reward: reward ? { id: reward.id } : undefined,
      });

      const savedPledge = await queryRunner.manager.save(pledge);
      await queryRunner.commitTransaction();

      return {
        pledgeId: savedPledge.id,
        paypalOrderId,
        approvalUrl,
        status: savedPledge.status,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async capturePayPalOrder(orderId: string) {
    const token = await this.getPayPalAccessToken();
    let captureId = `mock_capture_${Date.now()}`;
    let isSuccess = true;

    if (token !== 'mock_token') {
      try {
        const response = await lastValueFrom(
          this.httpService.post(
            `${this.paypalApiUrl}/v2/checkout/orders/${orderId}/capture`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            },
          ),
        );
        if (response.data.status !== 'COMPLETED') {
           isSuccess = false;
        } else {
           captureId = response.data.purchase_units[0].payments.captures[0].id;
        }
      } catch (error) {
         this.logger.error('Error capturando orden en PayPal', error);
         isSuccess = false;
      }
    }

    if (!isSuccess) {
       throw new BadRequestException('Payment could not be captured');
    }

    return this.processSuccessfulPledge(orderId, captureId);
  }

  async handlePayPalWebhook(payload: any) {
     const eventType = payload.event_type;
     if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
        const resource = payload.resource;
        // Dependiendo del payload de PayPal, usamos ID suplementario
        const orderId = resource.supplementary_data?.related_ids?.order_id || 'desconocido';
        if (orderId !== 'desconocido') {
           try {
             await this.processSuccessfulPledge(orderId, resource.id);
           } catch (e) {
             this.logger.warn('Webhook no procesó la donación (quizá ya estaba procesada)', e);
           }
        }
     }
     return { status: 'received' };
  }

  private async processSuccessfulPledge(paypalOrderId: string, captureId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
       const pledge = await queryRunner.manager.findOne(Pledge, {
          where: { paypalOrderId },
          relations: { project: { creator: true }, user: true, reward: true },
       });

       if (!pledge) throw new NotFoundException('Pledge not found');
       if (pledge.status === PledgeStatus.SUCCESS) {
          await queryRunner.rollbackTransaction();
          return pledge;
       }

       pledge.status = PledgeStatus.SUCCESS;
       pledge.transactionId = captureId;
       await queryRunner.manager.save(pledge);

       const project = pledge.project;
       project.raisedAmount = Number(project.raisedAmount) + Number(pledge.amount);
       await queryRunner.manager.save(project);

       await queryRunner.commitTransaction();

       this.eventEmitter.emit('new_pledge_received', {
         userId: project.creator.id,
         amount: pledge.amount,
         projectId: project.id,
         projectName: project.title,
       });
       return pledge;

    } catch (error) {
       await queryRunner.rollbackTransaction();
       throw error;
    } finally {
       await queryRunner.release();
    }
  }

  async getUserPledges(userId: string) {
     return this.dataSource.manager.find(Pledge, {
        where: { user: { id: userId } },
        relations: { project: true, reward: true },
        order: { createdAt: 'DESC' },
     });
  }

  async getProjectPledges(projectId: string, ownerId: string) {
     const project = await this.dataSource.manager.findOne(Project, {
        where: { id: projectId },
        relations: { creator: true },
     });
     
     if (!project) throw new NotFoundException('Project not found');
     if (project.creator.id !== ownerId) throw new BadRequestException('You do not own this project');

     return this.dataSource.manager.find(Pledge, {
        where: { project: { id: projectId } },
        relations: { user: true, reward: true },
        order: { createdAt: 'DESC' },
     });
  }
}
