import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard that requires a valid JWT Bearer token.
 * Apply with @UseGuards(JwtAuthGuard) on routes or controllers.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
