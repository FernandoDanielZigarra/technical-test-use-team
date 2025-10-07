import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('columns')
@UseGuards(JwtAuthGuard)
export class ColumnsController {
  constructor(private readonly columnsService: ColumnsService) {}

  @Post()
  create(
    @Body('projectId') projectId: string,
    @Body('title') title: string,
    @Request() req: any,
  ) {
    return this.columnsService.create(projectId, req.user.id, title);
  }

  @Get('project/:projectId')
  findAll(@Param('projectId') projectId: string, @Request() req: any) {
    return this.columnsService.findAll(projectId, req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.columnsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body('title') title: string,
    @Request() req: any,
  ) {
    return this.columnsService.update(id, req.user.id, title);
  }

  @Patch(':id/order')
  updateOrder(
    @Param('id') id: string,
    @Body('newOrder') newOrder: number,
    @Request() req: any,
  ) {
    return this.columnsService.updateOrder(id, req.user.id, newOrder);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.columnsService.remove(id, req.user.id);
  }
}
