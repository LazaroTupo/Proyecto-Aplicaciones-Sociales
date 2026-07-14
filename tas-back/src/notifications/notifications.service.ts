import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async getUserNotifications(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.notificationRepository.findAndCount({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });
    return { data, total, page, limit };
  }

  async markAsRead(notificationId: number, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, user: { id: userId } },
    });
    if (!notification) {
      throw new Error('Notificación no encontrada o no autorizada');
    }
    notification.isRead = true;
    return this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { user: { id: userId }, isRead: false },
      { isRead: true },
    );
    return { success: true, message: 'Todas las notificaciones marcadas como leídas' };
  }

  @OnEvent('new_pledge_received')
  async handleNewPledgeEvent(payload: { userId: string; amount: number; projectId: number; projectName: string }) {
    this.logger.log(`Handling new_pledge_received event for User ID: ${payload.userId}`);
    
    // 1. Guardar en PostgreSQL
    const notification = this.notificationRepository.create({
      user: { id: payload.userId },
      type: 'new_pledge',
      message: `¡Has recibido un nuevo aporte de $${payload.amount} en tu proyecto "${payload.projectName}"!`,
    });
    
    await this.notificationRepository.save(notification);

    // 2. Emitir por Socket si está conectado
    this.notificationsGateway.sendNotificationToUser(payload.userId, 'new_pledge_received', {
      notificationId: notification.id,
      type: notification.type,
      message: notification.message,
      createdAt: notification.createdAt,
    });
  }

  @OnEvent('project_status_changed')
  async handleProjectStatusChangedEvent(payload: { userId: string; projectId: number; projectName: string; status: string }) {
    this.logger.log(`Handling project_status_changed event for User ID: ${payload.userId}`);
    
    const notification = this.notificationRepository.create({
      user: { id: payload.userId },
      type: 'project_status_changed',
      message: `El estado de tu proyecto "${payload.projectName}" ha cambiado a: ${payload.status}.`,
    });
    
    await this.notificationRepository.save(notification);

    this.notificationsGateway.sendNotificationToUser(payload.userId, 'project_status_changed', {
      notificationId: notification.id,
      type: notification.type,
      message: notification.message,
      createdAt: notification.createdAt,
    });
  }
}
