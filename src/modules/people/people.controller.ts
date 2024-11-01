import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { PeopleService } from './people.service';
import { CreatePeopleDTO, createPeopleSchema } from './dtos/people.dto';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Post('create')
  async create(
    @Body(new ZodValidationPipe(createPeopleSchema))
    createPeopleDto: CreatePeopleDTO,
  ) {
    return await this.peopleService.create(createPeopleDto);
  }

  @Get('getTeachers/:id_course')
  async getTeachers(@Param('id_course') id_course: number) {
    return await this.peopleService.getTeachers(id_course);
  }
}
