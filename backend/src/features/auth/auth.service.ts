import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { UserService } from '../users/services/user.service';
import { JwtUtils } from '../../shared/utils';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtUtils: JwtUtils,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    if (!name || !email || !password) {
      throw new ConflictException('Todos los campos son obligatorios');
    }

    const user = await this.userService.createUser({
      email,
      password,
      name,
    });

    return this.generateAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userService.validateUserCredentials(
      email,
      password,
    );
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return this.generateAuthResponse(user);
  }

  private generateAuthResponse(user: {
    id: string;
    email: string;
    name: string | null;
  }) {
    return this.jwtUtils.generateAuthResponse({
      id: user.id,
      email: user.email,
      name: user.name || '',
    });
  }
}
