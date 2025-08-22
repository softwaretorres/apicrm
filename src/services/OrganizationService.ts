import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Organization } from '../entities/Organization';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { RoleService } from './RoleService';
import { 
  CreateOrganizationDTO,
  UpdateOrganizationDTO,
  UpdateSubscriptionDTO,
  OrganizationStats,
  SystemStats,
  OrganizationAlert,
  OrganizationSettings
} from '../types';

export class OrganizationService {
  private organizationRepository: Repository<Organization>;
  private userRepository: Repository<User>;
  private roleRepository: Repository<Role>;
  private roleService: RoleService;

  constructor() {
    this.organizationRepository = AppDataSource.getRepository(Organization);
    this.userRepository = AppDataSource.getRepository(User);
    this.roleRepository = AppDataSource.getRepository(Role);
    this.roleService = new RoleService();
  }

  // ============ CRUD ORGANIZACIONES ============
  
  async createOrganization(data: CreateOrganizationDTO): Promise<Organization> {
    // Verificar que no exista una organización con el mismo nombre
    const existingOrg = await this.organizationRepository.findOne({
      where: { name: data.name }
    });

    if (existingOrg) {
      throw new Error(`Organization with name '${data.name}' already exists`);
    }

    // Verificar que no exista un usuario con el mismo email
    const existingUser = await this.userRepository.findOne({
      where: { email: data.adminUser.email }
    });

    if (existingUser) {
      throw new Error(`User with email '${data.adminUser.email}' already exists`);
    }

    // Crear slug único
    const slug = await this.generateUniqueSlug(data.name);

    // Crear la organización
    const organization = this.organizationRepository.create({
      name: data.name,
      slug,
      description: data.description,
      address: data.address,
      city: data.city,
      state: data.state,
      zipCode: data.zipCode,
      country: data.country,
      phone: data.phone,
      email: data.email,
      website: data.website,
      licenseNumber: data.licenseNumber,
      taxId: data.taxId,
      subscriptionPlan: data.subscriptionPlan || 'basic',
      maxUsers: data.maxUsers || 5,
      maxProperties: data.maxProperties || 100,
      usersCount: 1, // El admin user
      propertiesCount: 0
    });

    const savedOrganization = await this.organizationRepository.save(organization);

    // Crear el usuario administrador
    const adminUser = this.userRepository.create({
      name: data.adminUser.name,
      email: data.adminUser.email,
      password: data.adminUser.password, // Asegúrate de hashear en producción
      firstName: data.adminUser.firstName,
      lastName: data.adminUser.lastName,
      phone: data.adminUser.phone,
      organizationId: savedOrganization.id,
      active: true, // Corregido: usar 'active' en lugar de 'isActive'
      emailVerifiedAt: new Date()
    });

    const savedUser = await this.userRepository.save(adminUser);

    // Asignar rol de admin al usuario
    await this.roleService.assignRoleToUser({
      userId: savedUser.id,
      roleId: await this.getAdminRoleId(),
      organizationId: savedOrganization.id
    });

    return this.getOrganizationById(savedOrganization.id);
  }

  async updateOrganization(id: number, data: UpdateOrganizationDTO): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({ where: { id } });
    
    if (!organization) {
      throw new Error('Organization not found');
    }

    // Si se cambia el nombre, generar nuevo slug
    if (data.name && data.name !== organization.name) {
      const slug = await this.generateUniqueSlug(data.name);
      (data as any).slug = slug;
    }

    await this.organizationRepository.update(id, data);
    return this.getOrganizationById(id);
  }

  async deleteOrganization(id: number): Promise<void> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['users']
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    // Verificar que no tenga usuarios activos (excepto si se fuerza)
    const activeUsers = organization.users?.filter(user => user.active) || []; // Corregido: usar 'active'
    if (activeUsers.length > 0) {
      throw new Error(`Cannot delete organization with ${activeUsers.length} active users`);
    }

    await this.organizationRepository.delete(id);
  }

  async getOrganizationById(id: number): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { id },
      relations: ['users']
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return organization;
  }

  async getOrganizationBySlug(slug: string): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({
      where: { slug },
      relations: ['users']
    });

    if (!organization) {
      throw new Error('Organization not found');
    }

    return organization;
  }

  async getAllOrganizations(filters?: {
    isActive?: boolean;
    subscriptionPlan?: string;
    isVerified?: boolean;
  }): Promise<Organization[]> {
    const queryBuilder = this.organizationRepository.createQueryBuilder('org')
      .leftJoinAndSelect('org.users', 'users');

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('org.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.subscriptionPlan) {
      queryBuilder.andWhere('org.subscriptionPlan = :plan', { plan: filters.subscriptionPlan });
    }

    if (filters?.isVerified !== undefined) {
      queryBuilder.andWhere('org.isVerified = :isVerified', { isVerified: filters.isVerified });
    }

    return queryBuilder
      .orderBy('org.name', 'ASC')
      .getMany();
  }

  // ============ GESTIÓN DE SUSCRIPCIONES ============

  async updateSubscription(id: number, data: UpdateSubscriptionDTO): Promise<Organization> {
    const organization = await this.organizationRepository.findOne({ where: { id } });
    
    if (!organization) {
      throw new Error('Organization not found');
    }

    await this.organizationRepository.update(id, {
      subscriptionPlan: data.subscriptionPlan,
      subscriptionExpiresAt: data.subscriptionExpiresAt,
      maxUsers: data.maxUsers,
      maxProperties: data.maxProperties
    });

    return this.getOrganizationById(id);
  }

  async extendSubscription(id: number, days: number): Promise<Organization> {
    const organization = await this.getOrganizationById(id);
    
    const currentExpiry = organization.subscriptionExpiresAt || new Date();
    const newExpiry = new Date(currentExpiry.getTime() + (days * 24 * 60 * 60 * 1000));

    return this.updateSubscription(id, {
      subscriptionPlan: organization.subscriptionPlan,
      subscriptionExpiresAt: newExpiry
    });
  }

  async getExpiredSubscriptions(): Promise<Organization[]> {
    const now = new Date();
    return this.organizationRepository
      .createQueryBuilder('org')
      .where('org.isActive = :isActive', { isActive: true })
      .andWhere('org.subscriptionExpiresAt < :now', { now })
      .getMany();
  }

  async getSubscriptionsExpiringSoon(days: number = 7): Promise<Organization[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

    return this.organizationRepository
      .createQueryBuilder('org')
      .where('org.isActive = :isActive', { isActive: true })
      .andWhere('org.subscriptionExpiresAt BETWEEN :now AND :futureDate', {
        now,
        futureDate
      })
      .orderBy('org.subscriptionExpiresAt', 'ASC')
      .getMany();
  }

  // ============ GESTIÓN DE USUARIOS ============

  async getOrganizationUsers(organizationId: number): Promise<User[]> {
    return this.userRepository.find({
      where: { organizationId, active: true }, // Corregido: usar 'active'
      relations: ['userRoles', 'userRoles.role'],
      order: { createdAt: 'ASC' }
    });
  }

  async addUserToOrganization(organizationId: number, userData: {
    name: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  }, roleId?: number): Promise<User> {
    const organization = await this.getOrganizationById(organizationId);

    // Verificar límites de usuarios
    if (!organization.canAddMoreUsers()) {
      throw new Error(`Organization has reached the maximum number of users (${organization.maxUsers})`);
    }

    // Verificar que el email no exista
    const existingUser = await this.userRepository.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new Error(`User with email '${userData.email}' already exists`);
    }

    // Crear el usuario
    const user = this.userRepository.create({
      ...userData,
      organizationId,
      active: true // Corregido: usar 'active'
    });

    const savedUser = await this.userRepository.save(user);

    // Asignar rol si se proporcionó
    if (roleId) {
      await this.roleService.assignRoleToUser({
        userId: savedUser.id,
        roleId,
        organizationId
      });
    }

    // Actualizar contador de usuarios
    await this.organizationRepository.update(organizationId, {
      usersCount: organization.usersCount + 1
    });

    return savedUser;
  }

  async removeUserFromOrganization(organizationId: number, userId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId, organizationId }
    });

    if (!user) {
      throw new Error('User not found in organization');
    }

    // No permitir eliminar al último admin
    const isAdmin = await this.roleService.userHasRole(userId, 'admin', organizationId);
    
    if (isAdmin) {
      const organizationUsers = await this.getOrganizationUsers(organizationId);
      const adminUsers = [];
      
      for (const orgUser of organizationUsers) {
        if (await this.roleService.userHasRole(orgUser.id, 'admin', organizationId)) {
          adminUsers.push(orgUser);
        }
      }
      
      if (adminUsers.length <= 1) {
        throw new Error('Cannot remove the last admin user from organization');
      }
    }

    // Desactivar usuario en lugar de eliminarlo y remover de organización
    await this.userRepository.update(userId, { 
      active: false,
      organizationId: undefined // Usar undefined en lugar de null
    });

    // Actualizar contador de usuarios
    const organization = await this.getOrganizationById(organizationId);
    await this.organizationRepository.update(organizationId, {
      usersCount: Math.max(0, organization.usersCount - 1)
    });
  }

  // ============ ESTADÍSTICAS ============

  async getOrganizationStats(organizationId: number): Promise<OrganizationStats> {
    const organization = await this.getOrganizationById(organizationId);
    const users = await this.userRepository.find({
      where: { organizationId }
    });
    
    const activeUsers = users.filter(user => user.active); // Corregido: usar 'active'
    
    // Aquí deberías consultar las propiedades reales
    // const properties = await this.propertyRepository.find({ where: { organizationId } });
    // Por ahora usamos el contador de la organización
    
    return {
      totalUsers: users.length,
      activeUsers: activeUsers.length,
      totalProperties: organization.propertiesCount,
      activeProperties: organization.propertiesCount, // Esto debería calcularse con propiedades activas
      subscriptionStatus: organization.getSubscriptionStatus(),
      remainingDays: organization.getRemainingDays(),
      usagePercentage: {
        users: organization.maxUsers > 0 ? (activeUsers.length / organization.maxUsers) * 100 : 0,
        properties: organization.maxProperties > 0 ? (organization.propertiesCount / organization.maxProperties) * 100 : 0
      }
    };
  }

  async getSystemStats(): Promise<SystemStats> {
    const allOrganizations = await this.getAllOrganizations();
    const activeOrganizations = allOrganizations.filter(org => org.isActive);
    
    const subscriptionBreakdown = allOrganizations.reduce((acc, org) => {
      acc[org.subscriptionPlan] = (acc[org.subscriptionPlan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalUsers = allOrganizations.reduce((sum, org) => sum + org.usersCount, 0);
    const totalProperties = allOrganizations.reduce((sum, org) => sum + org.propertiesCount, 0);

    // Proyección de ingresos (esto debería basarse en precios reales)
    const planPrices: Record<string, number> = {
      basic: 29,
      premium: 99,
      enterprise: 299
    };

    const revenueProjection = activeOrganizations.reduce((sum, org) => {
      return sum + (planPrices[org.subscriptionPlan] || 0);
    }, 0);

    return {
      totalOrganizations: allOrganizations.length,
      activeOrganizations: activeOrganizations.length,
      totalUsers,
      totalProperties,
      subscriptionBreakdown,
      revenueProjection
    };
  }

  // ============ MÉTODOS AUXILIARES ============

  private async generateUniqueSlug(name: string): Promise<string> {
    let baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    let slug = baseSlug;
    let counter = 1;

    while (await this.organizationRepository.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  private async getAdminRoleId(): Promise<number> {
    const adminRole = await this.roleRepository.findOne({
      where: { name: 'admin' }
    });

    if (!adminRole) {
      throw new Error('Admin role not found. Please run the roles seeder.');
    }

    return adminRole.id;
  }

  // ============ CONFIGURACIONES ============

  async updateOrganizationSettings(organizationId: number, settings: Record<string, any>): Promise<Organization> {
    const organization = await this.getOrganizationById(organizationId);
    
    const updatedSettings: OrganizationSettings = {
      ...organization.settings,
      ...settings
    };

    await this.organizationRepository.update(organizationId, {
      settings: updatedSettings
    });

    return this.getOrganizationById(organizationId);
  }

  async getOrganizationSettings(organizationId: number): Promise<Record<string, any>> {
    const organization = await this.getOrganizationById(organizationId);
    return organization.settings || {};
  }

  // ============ VERIFICACIÓN Y ACTIVACIÓN ============

  async verifyOrganization(organizationId: number): Promise<Organization> {
    await this.organizationRepository.update(organizationId, {
      isVerified: true
    });

    return this.getOrganizationById(organizationId);
  }

  async suspendOrganization(organizationId: number, reason?: string): Promise<Organization> {
    const organization = await this.getOrganizationById(organizationId);
    
    // Preparar las configuraciones actualizadas
    const updatedSettings: OrganizationSettings = {
      ...organization.settings,
      suspensionReason: reason,
      suspendedAt: new Date().toISOString()
    };

    await this.organizationRepository.update(organizationId, {
      isActive: false,
      settings: updatedSettings
    });

    // También desactivar todos los usuarios de la organización
    await this.userRepository.update(
      { organizationId },
      { active: false } // Corregido: usar 'active'
    );

    return this.getOrganizationById(organizationId);
  }

  async reactivateOrganization(organizationId: number): Promise<Organization> {
    const organization = await this.getOrganizationById(organizationId);
    
    // Verificar que la suscripción esté activa
    if (!organization.isSubscriptionActive()) {
      throw new Error('Cannot reactivate organization with expired subscription');
    }

    // Limpiar configuraciones de suspensión
    const updatedSettings: OrganizationSettings = { ...organization.settings };
    delete updatedSettings.suspensionReason;
    delete updatedSettings.suspendedAt;

    await this.organizationRepository.update(organizationId, {
      isActive: true,
      settings: updatedSettings
    });

    // Reactivar usuarios
    await this.userRepository.update(
      { organizationId },
      { active: true } // Corregido: usar 'active'
    );

    return this.getOrganizationById(organizationId);
  }

  // ============ BÚSQUEDA Y FILTROS ============

  async searchOrganizations(query: string, filters?: {
    subscriptionPlan?: string;
    isActive?: boolean;
    isVerified?: boolean;
  }): Promise<Organization[]> {
    const queryBuilder = this.organizationRepository.createQueryBuilder('org');

    if (query) {
      queryBuilder.where(
        '(org.name ILIKE :query OR org.email ILIKE :query OR org.city ILIKE :query)',
        { query: `%${query}%` }
      );
    }

    if (filters?.subscriptionPlan) {
      queryBuilder.andWhere('org.subscriptionPlan = :plan', { plan: filters.subscriptionPlan });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('org.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.isVerified !== undefined) {
      queryBuilder.andWhere('org.isVerified = :isVerified', { isVerified: filters.isVerified });
    }

    return queryBuilder
      .orderBy('org.name', 'ASC')
      .limit(50)
      .getMany();
  }

  // ============ NOTIFICACIONES Y ALERTAS ============

  async getOrganizationAlerts(organizationId: number): Promise<OrganizationAlert[]> {
    const organization = await this.getOrganizationById(organizationId);
    const stats = await this.getOrganizationStats(organizationId);
    const alerts: OrganizationAlert[] = [];

    // Alertas de suscripción
    if (organization.getSubscriptionStatus() === 'expired') {
      alerts.push({
        type: 'subscription_expired',
        severity: 'error',
        message: 'Your subscription has expired. Please renew to continue using the service.',
        actionRequired: true
      });
    } else if (organization.getRemainingDays() <= 7 && organization.getRemainingDays() > 0) {
      alerts.push({
        type: 'subscription_expiring',
        severity: 'warning',
        message: `Your subscription expires in ${organization.getRemainingDays()} days.`,
        actionRequired: true
      });
    }

    // Alertas de límites
    if (stats.usagePercentage.users >= 90) {
      alerts.push({
        type: 'user_limit_warning',
        severity: 'warning',
        message: `You're using ${Math.round(stats.usagePercentage.users)}% of your user limit.`,
        actionRequired: false
      });
    }

    if (stats.usagePercentage.properties >= 90) {
      alerts.push({
        type: 'property_limit_warning',
        severity: 'warning',
        message: `You're using ${Math.round(stats.usagePercentage.properties)}% of your property limit.`,
        actionRequired: false
      });
    }

    // Alerta de verificación
    if (!organization.isVerified) {
      alerts.push({
        type: 'verification_pending',
        severity: 'info',
        message: 'Your organization is pending verification.',
        actionRequired: false
      });
    }

    return alerts;
  }
}