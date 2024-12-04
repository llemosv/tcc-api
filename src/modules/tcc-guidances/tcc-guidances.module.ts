import { Module } from '@nestjs/common';
import { TccGuidancesService } from './tcc-guidances.service';
import { TccGuidancesController } from './tcc-guidances.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  controllers: [TccGuidancesController],
  imports: [NotificationsModule],
  providers: [TccGuidancesService],
})
export class TccGuidancesModule {}
