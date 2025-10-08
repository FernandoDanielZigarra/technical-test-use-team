import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { PrismaModule } from './core/prisma/prisma.module';
import { AuthModule } from './features/auth/auth.module';
import { ProjectsModule } from './features/projects/projects.module';
import { ColumnsModule } from './features/columns/columns.module';
import { TasksModule } from './features/tasks/tasks.module';
import { SocketModule } from './features/socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        uri:
          config.get<string>('MONGODB_URI') ??
          'mongodb://localhost:27017/kanban-board',
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    ColumnsModule,
    TasksModule,
    SocketModule,
  ],
})
export class AppModule {}
