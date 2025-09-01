import { AuthRepository } from '../../repositories/AuthRepository';
import { LoginCredentials } from '../../repositories/AuthRepository';

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  async execute(credentials: LoginCredentials) {
    // Validaciones de negocio podrían ir aquí
    if (!credentials.email || !credentials.password) {
      throw new Error('Email y contraseña son requeridos');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(credentials.email)) {
      throw new Error('El formato del correo electrónico no es válido');
    }

    return this.authRepository.login(credentials);
  }
}
