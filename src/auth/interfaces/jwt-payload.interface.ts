/**
 * Shape of the JWT token payload.
 * - sub: user ID (standard JWT claim)
 * - email: user email
 * - role: user role (STUDENT | TEACHER)
 */
export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}
