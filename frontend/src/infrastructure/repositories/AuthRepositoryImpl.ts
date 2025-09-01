import { AuthRepository, LoginCredentials } from '../../domain/repositories/AuthRepository';
import { AuthResponse, User } from '../../domain/entities/User';
import { httpClient } from '../api/httpClient';

export class AuthRepositoryImpl implements AuthRepository {
  private readonly AUTH_ENDPOINT = '/auth';
  private readonly TOKEN_KEY = 'token';
  private readonly USER_KEY = 'user';

  private getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    httpClient.setToken(token);
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    httpClient.clearToken();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('[Auth] Enviando credenciales al servidor...');
      const response = await httpClient.post<AuthResponse>(
        `${this.AUTH_ENDPOINT}/login`,
        credentials
      );
      
      const authData = response.data;
      
      if (!authData?.token) {
        throw new Error('No se recibió un token de autenticación válido');
      }
      
      // Almacenar el token
      this.setToken(authData.token);
      
      // Almacenar datos del usuario si están disponibles
      if (authData.user) {
        localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user));
      }
      
      console.log('[Auth] Inicio de sesión exitoso');
      return authData;
      
    } catch (error) {
      console.error('[Auth] Error en el inicio de sesión:', error);
      this.clearAuthData();
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await httpClient.post(`${this.AUTH_ENDPOINT}/logout`);
    } catch (error) {
      console.warn('[Auth] Error al cerrar sesión en el servidor:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await httpClient.get<User>(`${this.AUTH_ENDPOINT}/me`);
      
      if (response.data) {
        // Actualizar los datos del usuario en el almacenamiento local
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.data));
        return response.data;
      }
      
      return null;
      
    } catch (error: any) {
      console.error('[Auth] Error al obtener el usuario actual:', error);
      
      // Si el error es 401 (token expirado/inválido), limpiar los datos de autenticación
      if (error.response?.status === 401) {
        console.log('[Auth] Token expirado, limpiando datos de autenticación');
        this.clearAuthData();
      }
      
      return null;
    }
  }
}
