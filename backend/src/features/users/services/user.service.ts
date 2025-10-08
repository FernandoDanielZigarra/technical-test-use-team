import { Injectable, ConflictException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { PasswordUtils } from '../../../shared/utils';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createUser(userData: {
    email: string;
    password: string;
    name: string;
  }) {
    const { email, password, name } = userData;

    if (await this.userRepository.emailExists(email)) {
      throw new ConflictException('El usuario con este email ya existe');
    }

    const hashedPassword = await PasswordUtils.hashPassword(password, 10);

    return await this.userRepository.create({
      email,
      password: hashedPassword,
      name,
    });
  }

  async validateUserCredentials(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);
    if (!user) return null;

    const isPasswordValid = await PasswordUtils.comparePassword(
      password,
      user.password,
    );

    return isPasswordValid ? user : null;
  }

  async findUserByEmail(email: string) {
    return await this.userRepository.findByEmail(email);
  }

  async findUserById(userId: string) {
    return await this.userRepository.findById(userId);
  }
}
