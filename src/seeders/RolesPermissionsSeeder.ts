// src/seeders/RolesPermissionsSeeder.ts

import { BaseSeeder } from './BaseSeeder';
import { AppDataSource } from '../config/database';
import { Role } from '../entities/Role';
import { Permission } from '../entities/Permission';
import { RolePermission } from '../entities/RolePermission';

export class RolesPermissionsSeeder extends BaseSeeder {
  
  async run(): Promise<void> {
    const permissionRepository = AppDataSource.getRepository(Permission);
    const roleRepository = AppDataSource.getRepository(Role);
    const rolePermissionRepository = AppDataSource.getRepository(RolePermission);

    // ============ CREAR PERMISOS ============
    const permissions = [
      // Usuarios
      { name: 'users.create', displayName: 'Create Users', module: 'users', action: 'create', description: 'Create new users' },
      { name: 'users.read', displayName: 'View Users', module: 'users', action: 'read', description: 'View user information' },
      { name: 'users.update', displayName: 'Update Users', module: 'users', action: 'update', description: 'Update user information' },
      { name: 'users.delete', displayName: 'Delete Users', module: 'users', action: 'delete', description: 'Delete users' },
      { name: 'users.manage', displayName: 'Manage Users', module: 'users', action: 'manage', description: 'Full user management' },

      // Propiedades
      { name: 'properties.create', displayName: 'Create Properties', module: 'properties', action: 'create', description: 'Create new properties' },
      { name: 'properties.read', displayName: 'View Properties', module: 'properties', action: 'read', description: 'View property information' },
      { name: 'properties.update', displayName: 'Update Properties', module: 'properties', action: 'update', description: 'Update property information' },
      { name: 'properties.delete', displayName: 'Delete Properties', module: 'properties', action: 'delete', description: 'Delete properties' },
      { name: 'properties.manage', displayName: 'Manage Properties', module: 'properties', action: 'manage', description: 'Full property management' },
      { name: 'properties.publish', displayName: 'Publish Properties', module: 'properties', action: 'publish', description: 'Publish/unpublish properties' },

      // Roles y Permisos
      { name: 'roles.create', displayName: 'Create Roles', module: 'roles', action: 'create', description: 'Create new roles' },
      { name: 'roles.read', displayName: 'View Roles', module: 'roles', action: 'read', description: 'View role information' },
      { name: 'roles.update', displayName: 'Update Roles', module: 'roles', action: 'update', description: 'Update role information' },
      { name: 'roles.delete', displayName: 'Delete Roles', module: 'roles', action: 'delete', description: 'Delete roles' },
      { name: 'roles.assign', displayName: 'Assign Roles', module: 'roles', action: 'assign', description: 'Assign roles to users' },

      // Organizaciones
      { name: 'organizations.create', displayName: 'Create Organizations', module: 'organizations', action: 'create', description: 'Create new organizations' },
      { name: 'organizations.read', displayName: 'View Organizations', module: 'organizations', action: 'read', description: 'View organization information' },
      { name: 'organizations.update', displayName: 'Update Organizations', module: 'organizations', action: 'update', description: 'Update organization information' },
      { name: 'organizations.delete', displayName: 'Delete Organizations', module: 'organizations', action: 'delete', description: 'Delete organizations' },
      { name: 'organizations.manage', displayName: 'Manage Organizations', module: 'organizations', action: 'manage', description: 'Full organization management' },

      // Reportes y Analytics
      { name: 'reports.read', displayName: 'View Reports', module: 'reports', action: 'read', description: 'View reports and analytics' },
      { name: 'reports.export', displayName: 'Export Reports', module: 'reports', action: 'export', description: 'Export reports data' },

      // Configuraciones del Sistema
      { name: 'settings.read', displayName: 'View Settings', module: 'settings', action: 'read', description: 'View system settings' },
      { name: 'settings.update', displayName: 'Update Settings', module: 'settings', action: 'update', description: 'Update system settings' },

      // Catalogos (Property Types, Status, etc.)
      { name: 'catalogs.create', displayName: 'Create Catalogs', module: 'catalogs', action: 'create', description: 'Create catalog entries' },
      { name: 'catalogs.read', displayName: 'View Catalogs', module: 'catalogs', action: 'read', description: 'View catalog information' },
      { name: 'catalogs.update', displayName: 'Update Catalogs', module: 'catalogs', action: 'update', description: 'Update catalog entries' },
      { name: 'catalogs.delete', displayName: 'Delete Catalogs', module: 'catalogs', action: 'delete', description: 'Delete catalog entries' },
    ];

    this.log('Creating permissions...', 'info');
    const createdPermissions = await this.createIfNotExists<Permission>(
      Permission, 
      permissions, 
      'name'
    );

    // ============ CREAR ROLES ============
    const roles = [
      {
        name: 'super_admin',
        displayName: 'Super Administrator',
        description: 'Complete system access - manages everything',
        isSystemRole: true,
        displayOrder: 1,
        permissions: 'all' // Tendrá todos los permisos
      },
      {
        name: 'admin',
        displayName: 'Organization Administrator',
        description: 'Organization owner - manages organization and users',
        isSystemRole: false,
        displayOrder: 2,
        permissions: [
          'users.create', 'users.read', 'users.update', 'users.delete',
          'properties.create', 'properties.read', 'properties.update', 'properties.delete', 'properties.publish',
          'roles.read', 'roles.assign',
          'organizations.read', 'organizations.update',
          'reports.read', 'reports.export',
          'catalogs.create', 'catalogs.read', 'catalogs.update', 'catalogs.delete'
        ]
      },
      {
        name: 'manager',
        displayName: 'Property Manager',
        description: 'Manages properties and agents',
        isSystemRole: false,
        displayOrder: 3,
        permissions: [
          'users.read', 'users.update',
          'properties.create', 'properties.read', 'properties.update', 'properties.publish',
          'reports.read',
          'catalogs.read'
        ]
      },
      {
        name: 'agent',
        displayName: 'Real Estate Agent',
        description: 'Manages assigned properties',
        isSystemRole: false,
        displayOrder: 4,
        permissions: [
          'users.read',
          'properties.create', 'properties.read', 'properties.update',
          'catalogs.read'
        ]
      },
      {
        name: 'assistant',
        displayName: 'Administrative Assistant',
        description: 'Supports property and client management',
        isSystemRole: false,
        displayOrder: 5,
        permissions: [
          'users.read',
          'properties.read', 'properties.update',
          'catalogs.read'
        ]
      },
      {
        name: 'viewer',
        displayName: 'Viewer',
        description: 'Read-only access to properties',
        isSystemRole: false,
        displayOrder: 6,
        permissions: [
          'properties.read',
          'catalogs.read'
        ]
      }
    ];

    this.log('Creating roles...', 'info');
    const createdRoles = await this.createIfNotExists<Role>(
      Role, 
      roles.map(({ permissions, ...role }) => role), 
      'name'
    );

    // ============ ASIGNAR PERMISOS A ROLES ============
    this.log('Assigning permissions to roles...', 'info');

    // Obtener todos los permisos creados
    const allPermissions = await permissionRepository.find();
    const allRoles = await roleRepository.find();

    for (const roleData of roles) {
      const role = allRoles.find(r => r.name === roleData.name);
      if (!role) continue;

      this.log(`Assigning permissions to role: ${role.name}`, 'info');
      
      // Limpiar permisos existentes
      await rolePermissionRepository.delete({ roleId: role.id });

      let permissionsToAssign: Permission[] = [];

      if (roleData.permissions === 'all') {
        // Super admin gets all permissions
        permissionsToAssign = allPermissions;
      } else {
        // Other roles get specific permissions
        permissionsToAssign = allPermissions.filter(p => 
          roleData.permissions.includes(p.name)
        );
      }

      for (const permission of permissionsToAssign) {
        const rolePermission = rolePermissionRepository.create({
          roleId: role.id,
          permissionId: permission.id
        });
        await rolePermissionRepository.save(rolePermission);
      }

      this.log(`Assigned ${permissionsToAssign.length} permissions to ${role.name}`, 'success');
    }

    this.log(`Created ${allPermissions.length} permissions and ${allRoles.length} roles`, 'success');
  }

  // Método para crear un super admin inicial
  static async createInitialSuperAdmin(userData: {
    name: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<void> {
    const seeder = new RolesPermissionsSeeder();
    await seeder.ensureConnection();

    const userRepository = AppDataSource.getRepository('User');
    const roleRepository = AppDataSource.getRepository(Role);
    const userRoleRepository = AppDataSource.getRepository('UserRole');

    try {
      // Verificar si ya existe un super admin
      const superAdminRole = await roleRepository.findOne({ 
        where: { name: 'super_admin' } 
      });

      if (!superAdminRole) {
        throw new Error('Super admin role not found. Run roles seeder first.');
      }

      // Verificar si ya existe el usuario
      const existingUser = await userRepository.findOne({ 
        where: { email: userData.email } 
      });

      if (existingUser) {
        seeder.log('Super admin user already exists', 'info');
        return;
      }

      // Crear el usuario
      const user = userRepository.create({
        name: userData.name,
        email: userData.email,
        password: userData.password, // Asegúrate de hashear en producción
        firstName: userData.firstName,
        lastName: userData.lastName,
        emailVerifiedAt: new Date(),
        active: true
      });

      const savedUser = await userRepository.save(user);

      // Asignar rol de super admin
      const userRole = userRoleRepository.create({
        userId: savedUser.id,
        roleId: superAdminRole.id
      });

      await userRoleRepository.save(userRole);

      seeder.log('Initial super admin created successfully', 'success');
      seeder.log(`Email: ${userData.email}`, 'info');

    } catch (error) {
      seeder.log(`Error creating initial super admin: ${error}`, 'error');
      throw error;
    }
  }
}