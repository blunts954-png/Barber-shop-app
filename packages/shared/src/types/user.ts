export type UserRole = 'owner' | 'barber' | 'client';

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role: UserRole;
  emailVerified: boolean;
  phoneVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  password: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

export interface AuthTokenPayload {
  userId: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}
