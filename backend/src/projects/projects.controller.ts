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
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(
    @Body('name') name: string,
    @Body('description') description: string,
    @Request() req: any,
  ) {
    return this.projectsService.create(req.user.id, name, description);
  }

  @Get()
  findAll(@Request() req: any) {
    return this.projectsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('description') description: string,
    @Request() req: any,
  ) {
    return this.projectsService.update(id, req.user.id, name, description);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: any) {
    return this.projectsService.remove(id, req.user.id);
  }

  @Post(':id/participants')
  addParticipant(
    @Param('id') id: string,
    @Body('email') email: string,
    @Request() req: any,
  ) {
    return this.projectsService.addParticipant(id, req.user.id, email);
  }

  @Delete(':id/participants/:participantId')
  removeParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Request() req: any,
  ) {
    return this.projectsService.removeParticipant(
      id,
      req.user.id,
      parseInt(participantId),
    );
  }
}
