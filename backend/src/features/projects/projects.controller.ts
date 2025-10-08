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
import type { AuthenticatedRequest } from '../../common/types/authenticated-request.interface';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(
    @Body('name') name: string,
    @Body('description') description: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectsService.create(req.user.id, name, description);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.projectsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body('name') name: string,
    @Body('description') description: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectsService.update(id, req.user.id, name, description);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: AuthenticatedRequest) {
    return this.projectsService.remove(id, req.user.id);
  }

  @Post(':id/participants')
  addParticipant(
    @Param('id') id: string,
    @Body('email') email: string,
    @Body('role') role: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectsService.addParticipant(id, req.user.id, email, role);
  }

  @Delete(':id/participants/:participantId')
  removeParticipant(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectsService.removeParticipant(
      id,
      req.user.id,
      participantId,
    );
  }

  @Post(':id/leave')
  leaveProject(
    @Param('id') id: string,
    @Body('newOwnerId') newOwnerId: string | undefined,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectsService.leaveProject(id, req.user.id, newOwnerId);
  }

  @Patch(':id/participants/:participantId/role')
  updateParticipantRole(
    @Param('id') id: string,
    @Param('participantId') participantId: string,
    @Body('role') role: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectsService.updateParticipantRole(
      id,
      req.user.id,
      participantId,
      role,
    );
  }

  @Post(':id/export-backlog')
  exportBacklog(
    @Param('id') id: string,
    @Body('email') email: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.projectsService.exportBacklog(id, req.user.id, email);
  }
}
