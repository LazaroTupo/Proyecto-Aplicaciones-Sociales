import { Controller, Post, Get, Param, Body, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePledgeDto } from './dto/create-pledge.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('projects/:id/pledge')
  async createPledge(
    @Param('id') projectId: string,
    @Body() createPledgeDto: CreatePledgeDto,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.paymentsService.createPledge(projectId, userId, createPledgeDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('capture')
  async capturePayment(@Body('orderId') orderId: string) {
    return this.paymentsService.capturePayPalOrder(orderId);
  }

  @Post('webhook')
  async handleWebhook(@Body() payload: any) {
    return this.paymentsService.handlePayPalWebhook(payload);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/pledges')
  async getMyPledges(@Request() req: any) {
    return this.paymentsService.getUserPledges(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('projects/:id/pledges')
  async getProjectPledges(@Param('id') projectId: string, @Request() req: any) {
    return this.paymentsService.getProjectPledges(projectId, req.user.id);
  }
}
