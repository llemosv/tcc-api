import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { NotificationsModule } from '../notifications/notifications.module'; // Importe o NotificationsModule

@Module({
  imports: [NotificationsModule],
  controllers: [TasksController],
  providers: [TasksService],
})
export class TasksModule {}
