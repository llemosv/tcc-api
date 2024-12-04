import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ZodValidationPipe } from 'src/core/pipes/zod-validation.pipe';
import { TopicsService } from './topics.service';
import { CreateTopicDTO, createTopicSchema } from './dtos/create-topic.dto';
import {
  CreateTopicMessageDTO,
  createTopicMessageSchema,
} from './dtos/create-topic-message.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ConcludeTaskDTO } from '../tasks/dtos/conclude-task.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import multerConfig from 'src/config/multer.config';

@UseGuards(AuthGuard)
@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post('create')
  async create(
    @Body(new ZodValidationPipe(createTopicSchema))
    createTopicDTO: CreateTopicDTO,
  ) {
    return await this.topicsService.create(createTopicDTO);
  }

  @Post('createMessage')
  async createMessage(
    @Body(new ZodValidationPipe(createTopicMessageSchema))
    createTopicMessageDTO: CreateTopicMessageDTO,
  ) {
    return await this.topicsService.createMessage(createTopicMessageDTO);
  }

  @Get('/:idTask')
  async getTaskTopics(@Param('idTask') idTask: string) {
    return await this.topicsService.getTopics(idTask);
  }

  @Get('messages/:idTopic')
  async getTopicMessages(@Param('idTopic') idTopic: string) {
    return await this.topicsService.getMessages(idTopic);
  }

  @Patch(':id/conclude')
  async concludeTask(
    @Param('id') id: string,
    @Body() concludeTaskDTO: ConcludeTaskDTO,
  ) {
    const { conclude, justification } = concludeTaskDTO;

    return await this.topicsService.concludeTask(id, conclude, justification);
  }

  @Patch(':id/review')
  async pendingReview(@Param('id') id: string) {
    return await this.topicsService.pendingReview(id);
  }

  @Delete('delete/:id')
  async delete(@Param('id') id: string) {
    return await this.topicsService.delete(id);
  }

  @Post('upload/:idTopico')
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('idTopico') idTopico: string,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo não selecionado.');
    }

    await this.topicsService.uploadFile(
      idTopico,
      file.originalname,
      file.mimetype,
    );
  }

  @Get('filesTopic/:idTopico')
  async getFilesTopic(@Param('idTopico') idTopico: string) {
    return await this.topicsService.getFilesTopic(idTopico);
  }
}
