import { Controller, Get, Patch, Param, ParseIntPipe, Query, UseGuards, Request } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PaginationDto } from './dto/pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async getNotifications(
    @Request() req: any,
    @Query() paginationDto: PaginationDto,
  ) {
    const { page, limit } = paginationDto;
    return this.notificationsService.getUserNotifications(
      req.user.id || req.user.sub,
      page || 1,
      limit || 10,
    );
  }

  @Patch('read-all')
  async markAllAsRead(@Request() req: any) {
    return this.notificationsService.markAllAsRead(req.user.id || req.user.sub);
  }

  @Patch(':id/read')
  async markAsRead(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.markAsRead(id, req.user.id || req.user.sub);
  }
}
