import { Module, forwardRef } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { JwtModule } from '@nestjs/jwt';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '7d' },
    }),
    forwardRef(() => ProjectsModule),
  ],
  providers: [SocketGateway],
  exports: [SocketGateway],
})
export class SocketModule {}
