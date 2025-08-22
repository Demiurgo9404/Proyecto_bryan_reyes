import { usersApi } from './client';

export const userService = {
  // Obtener todos los usuarios
  async getUsers() {
    try {
      return await usersApi.list();
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  },

  // Obtener un usuario por ID
  async getUserById(id) {
    try {
      return await usersApi.getById(id);
    } catch (error) {
      console.error(`Error al obtener el usuario ${id}:`, error);
      throw error;
    }
  },

  // Actualizar un usuario
  async updateUser(id, userData) {
    try {
      return await usersApi.update(id, userData);
    } catch (error) {
      console.error(`Error al actualizar el usuario ${id}:`, error);
      throw error;
    }
  },

  // Eliminar un usuario
  async deleteUser(id) {
    try {
      return await usersApi.remove(id);
    } catch (error) {
      console.error(`Error al eliminar el usuario ${id}:`, error);
      throw error;
    }
  }
};

export default userService;
