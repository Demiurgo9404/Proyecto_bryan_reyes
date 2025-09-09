// infrastructure/database/postgres/UserRepository.js
const { Pool } = require('pg');
const User = require('../../../../domain/entities/User');

class UserRepositoryPostgres extends (require('../../../../domain/repositories/UserRepository')) {
  constructor(dependencies = {}) {
    super();
    this.pool = dependencies.pool || new Pool({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Roximar2025@localhost:5432/loverose_db',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    this.logger = dependencies.logger || console;
  }

  async create(userData) {
    const client = await this.pool.connect();
    try {
      const { email, username, passwordHash, role = 'user' } = userData;
      const query = `
        INSERT INTO users (email, username, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, username, role, created_at, updated_at
      `;
      
      const values = [email, username, passwordHash, role];
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        throw new Error('No se pudo crear el usuario');
      }
      
      return new User({
        ...result.rows[0],
        createdAt: result.rows[0].created_at,
        updatedAt: result.rows[0].updated_at
      });
    } catch (error) {
      this.logger.error('Error al crear usuario:', error);
      if (error.constraint === 'users_email_key') {
        throw new Error('El correo electrónico ya está en uso');
      }
      if (error.constraint === 'users_username_key') {
        throw new Error('El nombre de usuario ya está en uso');
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async findById(id) {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM users WHERE id = $1';
      const result = await client.query(query, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const userData = result.rows[0];
      return new User({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        passwordHash: userData.password_hash,
        role: userData.role,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      });
    } catch (error) {
      this.logger.error('Error al buscar usuario por ID:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async findByEmail(email) {
    const client = await this.pool.connect();
    try {
      const query = 'SELECT * FROM users WHERE email = $1';
      const result = await client.query(query, [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const userData = result.rows[0];
      return new User({
        id: userData.id,
        email: userData.email,
        username: userData.username,
        passwordHash: userData.password_hash,
        role: userData.role,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at
      });
    } catch (error) {
      this.logger.error('Error al buscar usuario por email:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id, userData) {
    const client = await this.pool.connect();
    try {
      const updates = [];
      const values = [id];
      let paramIndex = 2;

      // Construir la consulta dinámicamente basada en los campos proporcionados
      if (userData.email) {
        updates.push(`email = $${paramIndex++}`);
        values.push(userData.email);
      }
      if (userData.username) {
        updates.push(`username = $${paramIndex++}`);
        values.push(userData.username);
      }
      if (userData.passwordHash) {
        updates.push(`password_hash = $${paramIndex++}`);
        values.push(userData.passwordHash);
      }
      if (userData.role) {
        updates.push(`role = $${paramIndex++}`);
        values.push(userData.role);
      }

      if (updates.length === 0) {
        throw new Error('No se proporcionaron campos para actualizar');
      }

      const query = `
        UPDATE users 
        SET ${updates.join(', ')}, updated_at = NOW()
        WHERE id = $1
        RETURNING id, email, username, role, created_at, updated_at
      `;

      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      const updatedUser = result.rows[0];
      return new User({
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role,
        createdAt: updatedUser.created_at,
        updatedAt: updatedUser.updated_at
      });
    } catch (error) {
      this.logger.error('Error al actualizar usuario:', error);
      if (error.constraint === 'users_email_key') {
        throw new Error('El correo electrónico ya está en uso');
      }
      if (error.constraint === 'users_username_key') {
        throw new Error('El nombre de usuario ya está en uso');
      }
      throw error;
    } finally {
      client.release();
    }
  }

  async delete(id) {
    const client = await this.pool.connect();
    try {
      const query = 'DELETE FROM users WHERE id = $1 RETURNING id';
      const result = await client.query(query, [id]);
      return result.rows.length > 0;
    } catch (error) {
      this.logger.error('Error al eliminar usuario:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async list(filters = {}) {
    const client = await this.pool.connect();
    try {
      const { page = 1, limit = 10, role } = filters;
      const offset = (page - 1) * limit;
      
      const queryParams = [limit, offset];
      let whereClause = '';
      
      if (role) {
        whereClause = 'WHERE role = $3';
        queryParams.push(role);
      }
      
      const query = `
        SELECT id, email, username, role, created_at, updated_at 
        FROM users 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
      `;
      
      const countQuery = `
        SELECT COUNT(*) FROM users 
        ${whereClause}
      `;
      
      const [result, countResult] = await Promise.all([
        client.query(query, queryParams),
        client.query(countQuery, role ? [role] : [])
      ]);
      
      const totalItems = parseInt(countResult.rows[0].count, 10);
      const totalPages = Math.ceil(totalItems / limit);
      
      return {
        items: result.rows.map(row => new User({
          id: row.id,
          email: row.email,
          username: row.username,
          role: row.role,
          createdAt: row.created_at,
          updatedAt: row.updated_at
        })),
        pagination: {
          totalItems,
          totalPages,
          currentPage: page,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      this.logger.error('Error al listar usuarios:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = UserRepositoryPostgres;
