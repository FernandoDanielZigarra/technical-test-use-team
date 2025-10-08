import { Module } from '@nestjs/common';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { UsersController } from './users.controller';
import { PrismaService } from '../../core/prisma/prisma.service';

@Module({
  controllers: [UsersController],
  providers: [UserService, UserRepository, PrismaService],
  exports: [UserService, UserRepository],
})
export class UsersModule {}
