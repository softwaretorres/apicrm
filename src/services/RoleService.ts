import { Repository, IsNull } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Role } from '../entities/Role';
import { Permission } from '../entities/Permission';
import { RolePermission } from '../entities/RolePermission';
import { UserRole } from '../entities/UserRole';
import { User } from '../entities/User';
import { 
  CreateRoleDTO, 
  UpdateRoleDTO, 
  AssignRoleDTO,
  CreatePermissionDTO,
  UpdatePermissionDTO 
} from '../types';

export class RoleService {
  private roleRepository: Repository<Role>;
  private permissionRepository: Repository<Permission>;
  private rolePermissionRepository: Repository<RolePermission>;
  private userRoleRepository: Repository<UserRole>;
  private userRepository: Repository<User>;

  constructor() {
    this.roleRepository = AppDataSource.getRepository(Role);
    this.permissionRepository = AppDataSource.getRepository(Permission);
    this.rolePermissionRepository = AppDataSource.getRepository(RolePermission);
    this.userRoleRepository = AppDataSource.getRepository(UserRole);
    this.userRepository = AppDataSource.getRepository(User);
  }

  // ============ ROLES ============
  async createRole(data: CreateRoleDTO, createdBy?: number): Promise<Role> {
    const roleExists = await this.roleRepository.findOne({ 
      where: { name: data.name } 
    });
    
    if (roleExists) {
      throw new Error(`Role with name '${data.name}' already exists`);
    }

    const role = this.roleRepository.create({
      name: data.name,
      displayName: data.displayName,
      description: data.description,
      isSystemRole: false
    });

    const savedRole = await this.roleRepository.save(role);

    // Asignar permisos si se proporcionaron
    if (data.permissions && data.permissions.length > 0) {
      await this.assignPermissionsToRole(savedRole.id, data.permissions, createdBy);
    }

    return this.getRoleById(savedRole.id);
  }

    async findByName(name: string): Promise<Role | null> {
    return await this.roleRepository.findOne({
      where: { name },
      relations: ['rolePermissions', 'rolePermissions.permission']
    });
  }


  async updateRole(id: number, data: UpdateRoleDTO): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { id } });
    
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.isSystemRole) {
      throw new Error('System roles cannot be modified');
    }

    await this.roleRepository.update(id, data);
    return this.getRoleById(id);
  }

  async deleteRole(id: number): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { id } });
    
    if (!role) {
      throw new Error('Role not found');
    }

    if (role.isSystemRole) {
      throw new Error('System roles cannot be deleted');
    }

    // Verificar si el rol está siendo usado
    const userRolesCount = await this.userRoleRepository.count({ 
      where: { roleId: id, isActive: true } 
    });

    if (userRolesCount > 0) {
      throw new Error('Cannot delete role that is assigned to users');
    }

    await this.roleRepository.delete(id);
  }

  async getRoleById(id: number): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission']
    });

    if (!role) {
      throw new Error('Role not found');
    }

    return role;
  }

  async getAllRoles(includeSystemRoles: boolean = false): Promise<Role[]> {
    const where = includeSystemRoles ? {} : { isSystemRole: false };
    
    return this.roleRepository.find({
      where,
      relations: ['rolePermissions', 'rolePermissions.permission'],
      order: { name: 'ASC' }
    });
  }

  // ============ PERMISOS ============
  async assignPermissionsToRole(roleId: number, permissionIds: number[], grantedBy?: number): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    
    if (!role) {
      throw new Error('Role not found');
    }

    // Remover permisos existentes
    await this.rolePermissionRepository.delete({ roleId });

    // Agregar nuevos permisos
    const rolePermissions = permissionIds.map(permissionId => 
      this.rolePermissionRepository.create({
        roleId,
        permissionId,
        grantedBy
      })
    );

    await this.rolePermissionRepository.save(rolePermissions);
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    await this.rolePermissionRepository.delete({ roleId, permissionId });
  }

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const rolePermissions = await this.rolePermissionRepository.find({
      where: { roleId, isActive: true },
      relations: ['permission']
    });

    return rolePermissions.map(rp => rp.permission);
  }

  // ============ ASIGNACIÓN DE ROLES A USUARIOS ============
  async assignRoleToUser(data: AssignRoleDTO): Promise<UserRole> {
    const user = await this.userRepository.findOne({ where: { id: data.userId } });
    const role = await this.roleRepository.findOne({ where: { id: data.roleId } });

    if (!user) throw new Error('User not found');
    if (!role) throw new Error('Role not found');

    // Verificar si ya tiene el rol
    const whereCondition: any = { 
      userId: data.userId, 
      roleId: data.roleId
    };
    
    if (data.organizationId !== undefined) {
      whereCondition.organizationId = data.organizationId;
    } else {
      whereCondition.organizationId = IsNull();
    }

    const existingUserRole = await this.userRoleRepository.findOne({
      where: whereCondition
    });

    if (existingUserRole) {
      // Reactivar si está inactivo
      if (!existingUserRole.isActive) {
        existingUserRole.isActive = true;
        existingUserRole.expiresAt = data.expiresAt;
        return this.userRoleRepository.save(existingUserRole);
      }
      throw new Error('User already has this role');
    }

    const userRole = this.userRoleRepository.create({
      userId: data.userId,
      roleId: data.roleId,
      organizationId: data.organizationId,
      assignedBy: data.assignedBy,
      expiresAt: data.expiresAt
    });

    return this.userRoleRepository.save(userRole);
  }

  async removeRoleFromUser(userId: number, roleId: number, organizationId?: number): Promise<void> {
    const where: any = { userId, roleId };
    if (organizationId !== undefined) {
      where.organizationId = organizationId;
    } else {
      where.organizationId = IsNull();
    }

    const userRole = await this.userRoleRepository.findOne({ where });
    
    if (!userRole) {
      throw new Error('User role assignment not found');
    }

    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (role?.isSystemRole) {
      throw new Error('System roles cannot be removed');
    }

    await this.userRoleRepository.delete(where);
  }

  async getUserRoles(userId: number, organizationId?: number): Promise<Role[]> {
    const whereCondition: any = { userId, isActive: true };
    
    if (organizationId !== undefined) {
      whereCondition.organizationId = organizationId;
    } else {
      whereCondition.organizationId = IsNull();
    }

    const userRoles = await this.userRoleRepository.find({
      where: whereCondition,
      relations: ['role', 'role.rolePermissions', 'role.rolePermissions.permission']
    });

    return userRoles
      .filter(ur => ur.isValid())
      .map(ur => ur.role);
  }

  async getUserPermissions(userId: number, organizationId?: number): Promise<Permission[]> {
    const roles = await this.getUserRoles(userId, organizationId);
    const permissions: Permission[] = [];
    const permissionIds = new Set<number>();

    roles.forEach(role => {
      role.rolePermissions?.forEach(rp => {
        if (rp.isActive && rp.permission && !permissionIds.has(rp.permission.id)) {
          permissions.push(rp.permission);
          permissionIds.add(rp.permission.id);
        }
      });
    });

    return permissions;
  }

  // ============ VALIDACIONES ============
  async userHasRole(userId: number, roleName: string, organizationId?: number): Promise<boolean> {
    const roles = await this.getUserRoles(userId, organizationId);
    return roles.some(role => role.name === roleName);
  }

  async userHasPermission(userId: number, permissionName: string, organizationId?: number): Promise<boolean> {
    // Super admin tiene todos los permisos
    if (await this.userHasRole(userId, 'super_admin')) {
      return true;
    }

    const permissions = await this.getUserPermissions(userId, organizationId);
    return permissions.some(permission => permission.name === permissionName);
  }

  async userCanAccessModule(userId: number, module: string, organizationId?: number): Promise<boolean> {
    if (await this.userHasRole(userId, 'super_admin')) {
      return true;
    }

    const permissions = await this.getUserPermissions(userId, organizationId);
    return permissions.some(permission => permission.module === module);
  }
}