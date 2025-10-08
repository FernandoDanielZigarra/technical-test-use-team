import { Module } from '@nestjs/common';
import { ColumnsService } from './columns.service';
import { ColumnsController } from './columns.controller';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { ProjectsModule } from '../projects/projects.module';
import { SocketModule } from '../socket/socket.module';

@Module({
  imports: [PrismaModule, ProjectsModule, SocketModule],
  controllers: [ColumnsController],
  providers: [ColumnsService],
  exports: [ColumnsService],
})
export class ColumnsModule {}
