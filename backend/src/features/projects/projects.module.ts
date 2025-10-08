import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [PrismaModule, HttpModule, forwardRef(() => SocketModule)],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
