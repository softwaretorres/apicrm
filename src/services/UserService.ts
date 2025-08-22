// src/services/UserService.ts

import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Organization } from '../entities/Organization';
import { CreateUserDTO, UpdateUserDTO, UserStats } from '../types';

// Agregar esta interfaz al inicio del archivo
export interface UserFilters {
  search?: string;
  active?: boolean;
  verified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: keyof User;
  sortOrder?: 'ASC' | 'DESC';
  organizationId?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UserService {
  private userRepository: Repository<User>;
  private organizationRepository: Repository<Organization>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.organizationRepository = AppDataSource.getRepository(Organization);
  }

  // Método getUsers que falta
  async getUsers(filters: UserFilters): Promise<PaginatedResult<User>> {
    const {
      search,
      active,
      verified,
      page = 1,
      limit = 10,
      sortBy = 'id',
      sortOrder = 'DESC',
      organizationId
    } = filters;

    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role')
      .leftJoinAndSelect('user.organization', 'organization');

    // Aplicar filtros
    if (search) {
      queryBuilder.andWhere(
        '(user.name ILIKE :search OR user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (active !== undefined) {
      queryBuilder.andWhere('user.active = :active', { active });
    }

    if (verified !== undefined) {
      queryBuilder.andWhere(
        verified ? 'user.emailVerifiedAt IS NOT NULL' : 'user.emailVerifiedAt IS NULL'
      );
    }

    if (organizationId) {
      queryBuilder.andWhere('user.organizationId = :organizationId', { organizationId });
    }

    // Paginación
    const skip = (page - 1) * limit;
    queryBuilder
      .orderBy(`user.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [data, total] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages
    };
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id },
      relations: [
        'userRoles', 
        'userRoles.role', 
        'userRoles.role.rolePermissions', 
        'userRoles.role.rolePermissions.permission',
        'organization'
      ]
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      relations: [
        'userRoles', 
        'userRoles.role', 
        'userRoles.role.rolePermissions', 
        'userRoles.role.rolePermissions.permission',
        'organization'
      ]
    });
  }

  async createUser(userData: CreateUserDTO): Promise<User> {
    // Verificar que el email no exista
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Si se especifica organización, verificar que exista
    if (userData.organizationId) {
      const organization = await this.organizationRepository.findOne({
        where: { id: userData.organizationId }
      });
      
      if (!organization) {
        throw new Error('Organization not found');
      }

      if (!organization.canAddMoreUsers()) {
        throw new Error('Organization has reached maximum user limit');
      }
    }

    // Crear usuario
    const user = this.userRepository.create({
      ...userData,
      active: true,
      emailVerifiedAt: new Date()
    });

    const savedUser = await this.userRepository.save(user);

    // Actualizar contador de usuarios en la organización
    if (userData.organizationId) {
      await this.organizationRepository.increment(
        { id: userData.organizationId },
        'usersCount',
        1
      );
    }

    return this.findById(savedUser.id) as Promise<User>;
  }

  async updateUser(id: number, userData: UpdateUserDTO): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    await this.userRepository.update(id, userData);
    return this.findById(id) as Promise<User>;
  }

  // Corregir el método deleteUser para retornar boolean
  async deleteUser(id: number): Promise<boolean> {
    const user = await this.findById(id);
    if (!user) {
      return false;
    }

    // Soft delete - solo desactivar
    await this.userRepository.update(id, { active: false });

    // Actualizar contador de usuarios en la organización
    if (user.organizationId) {
      await this.organizationRepository.decrement(
        { id: user.organizationId },
        'usersCount',
        1
      );
    }

    return true;
  }

  // Agregar método toggleUserStatus
  async toggleUserStatus(id: number): Promise<User | null> {
    const user = await this.findById(id);
    if (!user) {
      return null;
    }

    const newStatus = !user.active;
    await this.userRepository.update(id, { active: newStatus });

    // Actualizar contador de usuarios en la organización
    if (user.organizationId) {
      if (newStatus) {
        await this.organizationRepository.increment(
          { id: user.organizationId },
          'usersCount',
          1
        );
      } else {
        await this.organizationRepository.decrement(
          { id: user.organizationId },
          'usersCount',
          1
        );
      }
    }

    return this.findById(id);
  }

  async getUsersByOrganization(organizationId: number): Promise<User[]> {
    return this.userRepository.find({
      where: { organizationId, active: true },
      relations: ['userRoles', 'userRoles.role'],
      order: { createdAt: 'DESC' }
    });
  }

  // Corregir método searchUsers para aceptar objeto criteria
  async searchUsers(criteria: {
    name?: string;
    email?: string;
    phone?: string;
    active?: boolean;
    organizationId?: number;
  }): Promise<User[]> {
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRoles')
      .leftJoinAndSelect('userRoles.role', 'role');

    let hasConditions = false;

    if (criteria.name) {
      queryBuilder.andWhere('user.name ILIKE :name', { name: `%${criteria.name}%` });
      hasConditions = true;
    }

    if (criteria.email) {
      queryBuilder.andWhere('user.email ILIKE :email', { email: `%${criteria.email}%` });
      hasConditions = true;
    }

    if (criteria.phone) {
      queryBuilder.andWhere('user.phone ILIKE :phone', { phone: `%${criteria.phone}%` });
      hasConditions = true;
    }

    if (criteria.active !== undefined) {
      queryBuilder.andWhere('user.active = :active', { active: criteria.active });
      hasConditions = true;
    }

    if (criteria.organizationId) {
      queryBuilder.andWhere('user.organizationId = :organizationId', { organizationId: criteria.organizationId });
      hasConditions = true;
    }

    if (!hasConditions) {
      queryBuilder.where('1=1'); // Condición dummy para evitar errores
    }

    return queryBuilder
      .orderBy('user.name', 'ASC')
      .limit(50)
      .getMany();
  }

  // Agregar método getRecentlyActiveUsers
  async getRecentlyActiveUsers(days: number): Promise<User[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return this.userRepository.find({
      where: {
        active: true,
        lastLoginAt: {
          gte: dateThreshold
        } as any
      },
      relations: ['userRoles', 'userRoles.role', 'organization'],
      order: { lastLoginAt: 'DESC' },
      take: 100
    });
  }

  async updateLastLogin(id: number): Promise<void> {
    await this.userRepository.update(id, {
      lastLoginAt: new Date()
    });
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    // Aquí deberías usar bcrypt para verificar la contraseña
    // return bcrypt.compare(password, user.password);
    
    // Por ahora comparación directa (NO usar en producción)
    return user.password === password;
  }

  async changePassword(id: number, newPassword: string): Promise<void> {
    // Aquí deberías hashear la contraseña con bcrypt
    // const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await this.userRepository.update(id, {
      password: newPassword // En producción usar hashedPassword
    });
  }

  async acceptInvitation(id: number): Promise<User> {
    await this.userRepository.update(id, {
      invitationAcceptedAt: new Date()
    });

    return this.findById(id) as Promise<User>;
  }

  async getUserStats(organizationId?: number): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    pendingInvitations: number;
  }> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (organizationId) {
      queryBuilder.where('user.organizationId = :organizationId', { organizationId });
    }

    const totalUsers = await queryBuilder.getCount();
    
    const activeUsers = await queryBuilder
      .clone()
      .andWhere('user.active = :active', { active: true })
      .getCount();

    const inactiveUsers = await queryBuilder
      .clone()
      .andWhere('user.active = :active', { active: false })
      .getCount();

    const pendingInvitations = await queryBuilder
      .clone()
      .andWhere('user.invitationAcceptedAt IS NULL')
      .andWhere('user.invitedBy IS NOT NULL')
      .andWhere('user.active = :active', { active: true })
      .getCount();

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      pendingInvitations
    };
  }
}