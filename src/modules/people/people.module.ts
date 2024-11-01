import { Module } from '@nestjs/common';
import { PeopleService } from './people.service';
import { PeopleController } from './people.controller';

@Module({
  controllers: [PeopleController],
  imports: [],
  providers: [PeopleService],
})
export class PeopleModule {}
