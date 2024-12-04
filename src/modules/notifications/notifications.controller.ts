import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../auth/auth.guard';
import { NotificationsService } from './notifications.service';

@UseGuards(AuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('/pending/:id')
  async getPending(@Param('id') id: string) {
    return await this.notificationsService.getPending(id);
  }

  @Post('/readAll/:id')
  async readAll(@Param('id') id: string) {
    return await this.notificationsService.readAll(id);
  }
}
