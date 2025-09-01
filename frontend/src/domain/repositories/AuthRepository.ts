import { User, AuthResponse } from '../entities/User';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  logout(): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthResponse>;
  getCurrentUser(): Promise<User | null>;
}
