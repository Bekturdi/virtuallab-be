export declare enum UserRole {
    STUDENT = "STUDENT",
    TEACHER = "TEACHER"
}
export declare class RegisterDto {
    email: string;
    password: string;
    fullName?: string;
    role?: UserRole;
}
