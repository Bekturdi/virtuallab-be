import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            fullName: string | null;
            role: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: number;
            email: string;
            fullName: string | null;
            role: string;
        };
    }>;
    getProfile(userId: number): Promise<{
        email: string;
        fullName: string | null;
        role: import("@prisma/client").$Enums.Role;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    private buildAuthResponse;
}
