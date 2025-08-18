import { AppDataSource } from '@/config/database';
import { User } from '@/entities/User';
import { FindManyOptions, Like } from 'typeorm';

export interface UserFilters {
  search?: string;
  active?: boolean;
  verified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'id' | 'name' | 'email' | 'createdAt' | 'lastLoginAt';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedUsers {
  data: Partial<User>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UserService {
  private userRepository = AppDataSource.getRepository(User);

  /**
   * Buscar usuario por ID
   */
  public async findById(id: number): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id }
    });
  }

  /**
   * Buscar usuario por email
   */
  public async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email: email.toLowerCase() }
    });
  }

  /**
   * Obtener lista de usuarios con filtros y paginación
   */
  public async getUsers(filters: UserFilters = {}): Promise<PaginatedUsers> {
    const {
      search,
      active,
      verified,
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'DESC'
    } = filters;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    // Filtros
    if (search) {
      queryBuilder.andWhere(
        '(user.name LIKE :search OR user.email LIKE :search OR user.firstName LIKE :search OR user.lastName LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (active !== undefined) {
      queryBuilder.andWhere('user.active = :active', { active });
    }

    if (verified !== undefined) {
      if (verified) {
        queryBuilder.andWhere('user.emailVerifiedAt IS NOT NULL');
      } else {
        queryBuilder.andWhere('user.emailVerifiedAt IS NULL');
      }
    }

    // Ordenamiento
    queryBuilder.orderBy(`user.${sortBy}`, sortOrder);

    // Paginación
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Ejecutar consulta
    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      data: users.map(user => user.toJSON()),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Crear nuevo usuario
   */
  public async createUser(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create({
      ...userData,
      email: userData.email?.toLowerCase(),
      active: userData.active ?? true
    });

    return await this.userRepository.save(user);
  }

  /**
   * Actualizar usuario
   */
  public async updateUser(id: number, updateData: Partial<User>): Promise<User | null> {
    await this.userRepository.update(id, {
      ...updateData,
      email: updateData.email?.toLowerCase()
    });

    return await this.findById(id);
  }

  /**
   * Eliminar usuario (soft delete - desactivar)
   */
  public async deleteUser(id: number): Promise<boolean> {
    const result = await this.userRepository.update(id, { active: false });
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Eliminar usuario permanentemente
   */
  public async permanentlyDeleteUser(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected ? result.affected > 0 : false;
  }

  /**
   * Activar/Desactivar usuario
   */
  public async toggleUserStatus(id: number): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) return null;

    user.active = !user.active;
    return await this.userRepository.save(user);
  }

  /**
   * Obtener estadísticas de usuarios
   */
  public async getUserStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    verified: number;
    unverified: number;
    recentlyRegistered: number;
  }> {
    const total = await this.userRepository.count();
    const active = await this.userRepository.count({ where: { active: true } });
    const inactive = total - active;
    
    const verified = await this.userRepository
      .createQueryBuilder('user')
      .where('user.emailVerifiedAt IS NOT NULL')
      .getCount();
    
    const unverified = total - verified;

    // Usuarios registrados en los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentlyRegistered = await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :thirtyDaysAgo', { thirtyDaysAgo })
      .getCount();

    return {
      total,
      active,
      inactive,
      verified,
      unverified,
      recentlyRegistered
    };
  }

  /**
   * Buscar usuarios por criterios múltiples
   */
  public async searchUsers(criteria: {
    name?: string;
    email?: string;
    phone?: string;
    active?: boolean;
  }): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (criteria.name) {
      queryBuilder.andWhere('user.name LIKE :name', { name: `%${criteria.name}%` });
    }

    if (criteria.email) {
      queryBuilder.andWhere('user.email LIKE :email', { email: `%${criteria.email}%` });
    }

    if (criteria.phone) {
      queryBuilder.andWhere('user.phone LIKE :phone', { phone: `%${criteria.phone}%` });
    }

    if (criteria.active !== undefined) {
      queryBuilder.andWhere('user.active = :active', { active: criteria.active });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Verificar si un email está disponible
   */
  public async isEmailAvailable(email: string, excludeUserId?: number): Promise<boolean> {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email: email.toLowerCase() });

    if (excludeUserId) {
      queryBuilder.andWhere('user.id != :excludeUserId', { excludeUserId });
    }

    const existingUser = await queryBuilder.getOne();
    return !existingUser;
  }

  /**
   * Obtener usuarios activos recientemente
   */
  public async getRecentlyActiveUsers(days: number = 7): Promise<User[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return await this.userRepository
      .createQueryBuilder('user')
      .where('user.lastLoginAt >= :dateThreshold', { dateThreshold })
      .andWhere('user.active = :active', { active: true })
      .orderBy('user.lastLoginAt', 'DESC')
      .getMany();
  }
}