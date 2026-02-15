import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /auth/register
   * Create a new user account and return a JWT token.
   */
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login
   * Authenticate with email + password, return a JWT token.
   * Returns 200 (not 201) on success.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  /**
   * GET /auth/me
   * Protected route — returns the current user's profile.
   * Requires a valid Bearer token in the Authorization header.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req: { user: { id: number } }) {
    return this.authService.getProfile(req.user.id);
  }
}
