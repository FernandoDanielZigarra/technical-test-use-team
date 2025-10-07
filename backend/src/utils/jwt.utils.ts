import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

export interface JwtPayload {
  email: string;
  sub: number;
  iat?: number;
  exp?: number;
}

export interface AuthTokens {
  access_token: string;
  user: {
    id: number;
    email: string;
    name: string;
  };
}

@Injectable()
export class JwtUtils {
  constructor(private readonly jwtService: JwtService) {}

  generateToken(userId: number, email: string): string {
    const payload: JwtPayload = {
      email,
      sub: userId,
    };

    return this.jwtService.sign(payload);
  }

  generateAuthResponse(user: {
    id: number;
    email: string;
    name: string;
  }): AuthTokens {
    const access_token = this.generateToken(user.id, user.email);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  verifyToken(token: string): JwtPayload {
    try {
      return this.jwtService.verify<JwtPayload>(token);
    } catch {
      throw new Error('Token inválido o expirado');
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      return this.jwtService.decode<JwtPayload>(token);
    } catch {
      return null;
    }
  }

  getUserIdFromToken(token: string): number | null {
    try {
      const payload = this.verifyToken(token);
      return payload.sub;
    } catch {
      return null;
    }
  }

  getUserEmailFromToken(token: string): string | null {
    try {
      const payload = this.verifyToken(token);
      return payload.email;
    } catch {
      return null;
    }
  }
  isTokenValid(token: string): boolean {
    try {
      this.verifyToken(token);
      return true;
    } catch {
      return false;
    }
  }
}
