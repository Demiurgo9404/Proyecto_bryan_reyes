// domain/repositories/UserRepository.js

class UserRepository {
  async create(userData) {
    throw new Error('Método no implementado: create');
  }

  async findById(id) {
    throw new Error('Método no implementado: findById');
  }

  async findByEmail(email) {
    throw new Error('Método no implementado: findByEmail');
  }

  async update(id, userData) {
    throw new Error('Método no implementado: update');
  }

  async delete(id) {
    throw new Error('Método no implementado: delete');
  }

  async list(filters = {}) {
    throw new Error('Método no implementado: list');
  }
}

module.exports = UserRepository;
