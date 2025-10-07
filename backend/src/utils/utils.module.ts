import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PasswordUtils } from './password.utils';
import { JwtUtils } from './jwt.utils';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [PasswordUtils, JwtUtils],
  exports: [PasswordUtils, JwtUtils],
})
export class UtilsModule {}
