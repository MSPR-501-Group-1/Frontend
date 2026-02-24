// User roles for RBAC
export enum UserRole {
    ADMIN = 'admin',
    DATA_ENGINEER = 'data_engineer',
    PRODUCT_OWNER = 'product_owner',
    DIRECTION = 'direction',
    PARTNER = 'partner',
}

// Basic user type
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    avatar?: string;
}
