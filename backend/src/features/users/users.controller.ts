import { Controller, Get, Delete, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserService } from './users.service';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getCurrentUser(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    const user = await this.userService.findUserById(userId);

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  @Delete('me')
  async deleteAccount(@Request() req: AuthenticatedRequest) {
    const userId = req.user.id;
    return this.userService.deleteAccount(userId);
  }
}
