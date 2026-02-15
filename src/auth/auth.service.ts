import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

/**
 * Argon2id configuration following OWASP 2025 Password Storage Cheat Sheet.
 *
 * - Algorithm : Argon2id (hybrid — resists both side-channel and GPU attacks)
 * - Memory    : 19 MiB (19 456 KiB) — OWASP minimum recommended
 * - Iterations: 2                    — OWASP minimum recommended
 * - Parallelism: 1                   — single-threaded to prevent DoS amplification
 *
 * These values produce a hash in ~40-80 ms on commodity hardware,
 * which is acceptable for login latency while being expensive for brute-force.
 */
const ARGON2_OPTIONS: argon2.Options & { raw?: false } = {
  type: argon2.argon2id,
  memoryCost: 19456, // 19 MiB in KiB
  timeCost: 2,
  parallelism: 1,
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Register a new user.
   * - Checks email uniqueness
   * - Hashes password with Argon2id
   * - Returns JWT + user info (no password)
   */
  async register(dto: RegisterDto) {
    // Check for existing user with this email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    // Hash password with Argon2id (OWASP 2025 params)
    const hashedPassword = await argon2.hash(dto.password, ARGON2_OPTIONS);

    // Create user — if dto.role is undefined, Prisma uses the schema default (STUDENT)
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        role: dto.role,
      },
    });

    return this.buildAuthResponse(user);
  }

  /**
   * Authenticate an existing user.
   * - Uses constant-time comparison via argon2.verify
   * - Returns a generic "Invalid credentials" on failure to prevent
   *   email enumeration attacks
   */
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      // Generic message prevents email enumeration
      throw new UnauthorizedException('Invalid credentials');
    }

    // argon2.verify reads params from the stored hash — no need to pass ARGON2_OPTIONS
    const isPasswordValid = await argon2.verify(user.password, dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  /**
   * Return the authenticated user's profile (no password).
   */
  async getProfile(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        // password is deliberately excluded
      },
    });
  }

  // ────────────────────────────────────────────────────────────────
  // Private helpers
  // ────────────────────────────────────────────────────────────────

  /**
   * Build a standard auth response with a signed JWT and safe user data.
   * The password field is never included.
   */
  private async buildAuthResponse(user: {
    id: number;
    email: string;
    fullName: string | null;
    role: string;
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
}
