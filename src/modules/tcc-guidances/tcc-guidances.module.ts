import { Module } from '@nestjs/common';
import { TccGuidancesService } from './tcc-guidances.service';
import { TccGuidancesController } from './tcc-guidances.controller';

@Module({
  controllers: [TccGuidancesController],
  imports: [],
  providers: [TccGuidancesService],
})
export class TccGuidancesModule {}
