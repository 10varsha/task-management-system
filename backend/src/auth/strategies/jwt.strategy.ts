import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret-key-change-me',
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload); // Debug log
    console.log('Looking for user with ID:', payload.sub); // Debug log

    try {
      const user = await this.usersService.findOne(payload.sub);
      console.log('User found:', user); // Debug log

      if (!user) {
        console.error('User not found for ID:', payload.sub); // Debug log
        throw new UnauthorizedException('User not found');
      }

      return user;
    } catch (error) {
      console.error('Error in JWT validation:', error); // Debug log
      throw new UnauthorizedException('Authentication failed');
    }
  }
}
