import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces/jwt-payload.interface';

/**
 * Passport JWT strategy.
 *
 * - Extracts the Bearer token from the Authorization header
 * - Verifies signature + expiration using the shared JWT_SECRET
 * - Returns a lean user object attached to request.user
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error(
        'JWT_SECRET is not defined in environment variables. ' +
          'Add it to your .env file.',
      );
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  /**
   * Called by Passport after the token is verified.
   * The returned object is attached to `request.user`.
   */
  validate(payload: JwtPayload): { id: number; email: string; role: string } {
    if (!payload.sub) {
      throw new UnauthorizedException('Invalid token payload');
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
