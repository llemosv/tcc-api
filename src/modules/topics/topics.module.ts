import { Module } from '@nestjs/common';
import { TopicsController } from './topics.controller';
import { TopicsService } from './topics.service';
import { TopicsGateway } from './topics.gateway';
import { S3Service } from 'src/shared/s3Provider/s3.service';

@Module({
  controllers: [TopicsController],
  providers: [TopicsService, TopicsGateway, S3Service],
})
export class TopicsModule {}
