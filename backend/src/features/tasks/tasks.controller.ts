import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('column/:columnId')
  create(
    @Param('columnId') columnId: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('assigneeId') assigneeId: string | null,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.create(
      columnId,
      req.user.id,
      title,
      description,
      assigneeId,
    );
  }

  @Get('column/:columnId')
  findAll(
    @Param('columnId') columnId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.findAll(columnId, req.user.id);
  }

  @Get('/:id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tasksService.findOne(id, req.user.id);
  }

  @Patch('/:id')
  update(
    @Param('id') id: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @Body('assigneeId') assigneeId: string | null,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.update(
      id,
      req.user.id,
      title,
      description,
      assigneeId,
    );
  }

  @Patch('/:id/move')
  moveTask(
    @Param('id') id: string,
    @Body('targetColumnId') targetColumnId: string,
    @Body('newOrder') newOrder: number,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.tasksService.moveTask(
      id,
      req.user.id,
      targetColumnId,
      newOrder,
    );
  }

  @Delete('/:id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.tasksService.remove(id, req.user.id);
  }
}
