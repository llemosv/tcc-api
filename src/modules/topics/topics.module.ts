import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { TopicsGateway } from './topics.gateway';

@Module({
  controllers: [TopicsController],
  providers: [TopicsService, TopicsGateway],
})
export class TopicsModule {}
