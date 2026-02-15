import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsEnum,
} from 'class-validator';

/**
 * Local enum matching Prisma's Role enum.
 * Kept separate so the DTO layer doesn't depend on generated code.
 */
export enum UserRole {
  STUDENT = 'STUDENT',
  TEACHER = 'TEACHER',
}

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;

  @IsString()
  @IsOptional()
  fullName?: string;

  /**
   * Defaults to STUDENT at the database level if omitted.
   * For MVP, any role is accepted; restrict TEACHER in production
   * via an admin-only flow.
   */
  @IsEnum(UserRole, { message: 'Role must be either STUDENT or TEACHER' })
  @IsOptional()
  role?: UserRole;
}
