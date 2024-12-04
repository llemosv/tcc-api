import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { TccGuidancesService } from './tcc-guidances.service';
import {
  CreateTccGuidanceDTO,
  createTccGuidanceSchema,
} from './dtos/create-tcc-guidance.dto';
import {
  RespondGuidanceRequestDTO,
  respondGuidanceRequestSchema,
} from './dtos/respond-to-guidance-request.dto';
import { AuthGuard } from '../auth/auth.guard';
import {
  UpdateTccThemeDTO,
  updateTccThemeSchema,
} from './dtos/update-tcc-theme.dto';

@UseGuards(AuthGuard)
@Controller('tccGuidances')
export class TccGuidancesController {
  constructor(private readonly tccGuidancesService: TccGuidancesService) {}

  @Post('create')
  async create(
    @Body(new ZodValidationPipe(createTccGuidanceSchema))
    createSolicitationDto: CreateTccGuidanceDTO,
  ) {
    return await this.tccGuidancesService.create(createSolicitationDto);
  }

  @Get('findGuidances/:id/:type')
  async findGuidances(
    @Param('id') id: string,
    @Param('type') type: 'aluno' | 'orientador',
    @Query('name') name?: string,
    @Query('status') status?: 'refused' | 'pending' | 'accepted',
    @Query('teacher') teacher?: string,
    @Query('idCourse') idCourse?: string,
  ) {
    return await this.tccGuidancesService.findGuidances(
      id,
      type,
      name,
      status,
      teacher,
      idCourse,
    );
  }

  @Get('findPendingGuidances/:id')
  async findPendingGuidances(@Param('id') id: string) {
    return await this.tccGuidancesService.findPendingGuidances(id);
  }

  @Put('respondToGuidanceRequest/:id')
  async respondToGuidanceRequest(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(respondGuidanceRequestSchema))
    respondGuidanceRequestDTO: RespondGuidanceRequestDTO,
  ): Promise<any> {
    await this.tccGuidancesService.respondToGuidanceRequest(
      id,
      respondGuidanceRequestDTO,
    );
  }

  @Put('updateTccTheme/:id')
  async updateTccTheme(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateTccThemeSchema))
    updateTccThemeDTO: UpdateTccThemeDTO,
  ): Promise<any> {
    await this.tccGuidancesService.updateTccTheme(id, updateTccThemeDTO);
  }

  @Get('getGuidancesCount/:id_course')
  async getGuidancesCount(@Param('id_course') id_course: string) {
    return await this.tccGuidancesService.getGuidancesCount(id_course);
  }

  @Get('getTeacherGuidancesCount/:id_course')
  async getTeacherGuidancesCount(@Param('id_course') id_course: string) {
    return await this.tccGuidancesService.getTeacherGuidancesCount(id_course);
  }

  @Post('conclude/:id_tcc')
  async conclude(@Param('id_tcc') id_tcc: string) {
    return await this.tccGuidancesService.concludeGuidance(id_tcc);
  }
}
