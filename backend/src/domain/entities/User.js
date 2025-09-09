// domain/entities/User.js

class User {
  constructor({ id, email, username, passwordHash, role, createdAt, updatedAt }) {
    this.id = id;
    this.email = email;
    this.username = username;
    this.passwordHash = passwordHash;
    this.role = role || 'user';
    this.createdAt = createdAt || new Date();
    this.updatedAt = updatedAt || new Date();
  }

  validate() {
    const errors = [];
    
    if (!this.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push('Email inválido');
    }
    
    if (!this.username || this.username.length < 3) {
      errors.push('El nombre de usuario debe tener al menos 3 caracteres');
    }
    
    if (!this.passwordHash) {
      errors.push('Se requiere una contraseña');
    }
    
    return errors;
  }

  toJSON() {
    const { passwordHash, ...user } = this;
    return user;
  }
}

module.exports = User;
