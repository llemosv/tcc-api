import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
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
}
