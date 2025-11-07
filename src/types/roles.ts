// src/types/roles.ts

export interface CreateRoleDTO {
  name: string;
  displayName: string;
  description?: string;
  permissions?: number[];
}

export interface UpdateRoleDTO {
  displayName?: string;
  description?: string;
  isActive?: boolean;
}


export interface AssignRoleDTO {
  userId: number;
  roleId: number;
  organizationId?: number;
  expiresAt?: Date;
  assignedBy?: number;
}


export interface CreatePermissionDTO {
  name: string;
  displayName: string;
  description?: string;
  module: string;
  action: string;
}

export interface UpdatePermissionDTO {
  displayName?: string;
  description?: string;
  isActive?: boolean;
}

export interface RoleWithPermissions {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  isSystemRole: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
  permissions: PermissionInfo[];
  usersCount: number;
  permissionsCount: number;
  canBeDeleted: boolean;
  canBeModified: boolean;
}

export interface PermissionInfo {
  id: number;
  name: string;
  displayName: string;
  description?: string;
  module: string;
  action: string;
  fullPermission: string;
  level: 'read' | 'write' | 'manage' | 'admin';
  isActive: boolean;
  isSystemPermission: boolean;
  rolesCount: number;
  canBeDeleted: boolean;
}

export interface RoleCapabilities {
  isSuperAdmin: boolean;
  isAdmin: boolean;
  canManageUsers: boolean;
  canManageProperties: boolean;
  canManageRoles: boolean;
  canManageOrganizations: boolean;
  canViewReports: boolean;
  canManageSettings: boolean;
}

export interface ModulePermissions {
  module: string;
  permissions: PermissionInfo[];
  hasAccess: boolean;
  availableActions: string[];
}

// Enums para consistencia
export enum RoleNames {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MANAGER = 'manager',
  AGENT = 'agent',
  ASSISTANT = 'assistant',
  VIEWER = 'viewer'
}

export enum PermissionModules {
  USERS = 'users',
  PROPERTIES = 'properties',
  ROLES = 'roles',
  ORGANIZATIONS = 'organizations',
  REPORTS = 'reports',
  SETTINGS = 'settings',
  CATALOGS = 'catalogs'
}

export enum PermissionActions {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  MANAGE = 'manage',
  PUBLISH = 'publish',
  ASSIGN = 'assign',
  EXPORT = 'export'
}

// Importar y re-exportar UserRoleInfo desde user.ts para evitar ambigüedad
export type { UserRoleInfo } from './user';
