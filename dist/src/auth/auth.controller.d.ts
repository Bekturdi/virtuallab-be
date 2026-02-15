import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    getProfile(req: {
        user: {
            id: number;
        };
    }): Promise<{
        email: string;
        fullName: string | null;
        role: import("@prisma/client").$Enums.Role;
        id: number;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
}
