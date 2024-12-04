import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';

@Module({
  imports: [],
  providers: [],
  exports: [S3Service],
})
export class S3Module {}
