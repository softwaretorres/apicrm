import { Request, Response } from 'express';
import { RoleService } from '../services/RoleService';
import { validationResult } from 'express-validator';
import { CreateRoleDTO, UpdateRoleDTO, AssignRoleDTO } from '../types';

export class RoleController {
  private roleService: RoleService;

  constructor() {
    this.roleService = new RoleService();
  }

  // ============ CRUD DE ROLES ============
  
  // GET /api/roles
  getAllRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const includeSystemRoles = req.query.includeSystem === 'true';
      const roles = await this.roleService.getAllRoles(includeSystemRoles);

      res.json({
        success: true,
        data: roles,
        message: 'Roles retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve roles',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /api/roles/:id
  getRoleById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const role = await this.roleService.getRoleById(parseInt(id));

      res.json({
        success: true,
        data: role,
        message: 'Role retrieved successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Role not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to retrieve role'
      });
    }
  };

  // POST /api/roles
  createRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const roleData: CreateRoleDTO = req.body;
      const createdBy = req.user?.id;
      
      const role = await this.roleService.createRole(roleData, createdBy);

      res.status(201).json({
        success: true,
        data: role,
        message: 'Role created successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message.includes('already exists') ? 409 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create role'
      });
    }
  };

  // PUT /api/roles/:id
  updateRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const updateData: UpdateRoleDTO = req.body;
      
      const role = await this.roleService.updateRole(parseInt(id), updateData);

      res.json({
        success: true,
        data: role,
        message: 'Role updated successfully'
      });
    } catch (error) {
      let statusCode = 500;
      if (error instanceof Error) {
        if (error.message === 'Role not found') statusCode = 404;
        if (error.message.includes('System roles cannot be modified')) statusCode = 403;
      }

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update role'
      });
    }
  };

  // DELETE /api/roles/:id
  deleteRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.roleService.deleteRole(parseInt(id));

      res.json({
        success: true,
        message: 'Role deleted successfully'
      });
    } catch (error) {
      let statusCode = 500;
      if (error instanceof Error) {
        if (error.message === 'Role not found') statusCode = 404;
        if (error.message.includes('System roles cannot be deleted')) statusCode = 403;
        if (error.message.includes('Cannot delete role that is assigned')) statusCode = 409;
      }

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete role'
      });
    }
  };

  // ============ GESTIÓN DE PERMISOS ============

  // GET /api/roles/:id/permissions
  getRolePermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const permissions = await this.roleService.getRolePermissions(parseInt(id));

      res.json({
        success: true,
        data: permissions,
        message: 'Role permissions retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve role permissions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // PUT /api/roles/:id/permissions
  updateRolePermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { id } = req.params;
      const { permissionIds } = req.body;
      const grantedBy = req.user?.id;

      await this.roleService.assignPermissionsToRole(parseInt(id), permissionIds, grantedBy);

      res.json({
        success: true,
        message: 'Role permissions updated successfully'
      });
    } catch (error) {
      const statusCode = error instanceof Error && error.message === 'Role not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update role permissions'
      });
    }
  };

  // ============ ASIGNACIÓN DE ROLES A USUARIOS ============

  // POST /api/roles/assign
  assignRoleToUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const assignData: AssignRoleDTO = {
        ...req.body,
        assignedBy: req.user?.id
      };

      const userRole = await this.roleService.assignRoleToUser(assignData);

      res.status(201).json({
        success: true,
        data: userRole,
        message: 'Role assigned to user successfully'
      });
    } catch (error) {
      let statusCode = 500;
      if (error instanceof Error) {
        if (error.message.includes('not found')) statusCode = 404;
        if (error.message.includes('already has this role')) statusCode = 409;
      }

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to assign role to user'
      });
    }
  };

  // DELETE /api/roles/remove
  removeRoleFromUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
        return;
      }

      const { userId, roleId, organizationId } = req.body;

      await this.roleService.removeRoleFromUser(userId, roleId, organizationId);

      res.json({
        success: true,
        message: 'Role removed from user successfully'
      });
    } catch (error) {
      let statusCode = 500;
      if (error instanceof Error) {
        if (error.message.includes('not found')) statusCode = 404;
        if (error.message.includes('System roles cannot be removed')) statusCode = 403;
      }

      res.status(statusCode).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove role from user'
      });
    }
  };

  // GET /api/users/:userId/roles
  getUserRoles = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { organizationId } = req.query;

      const roles = await this.roleService.getUserRoles(
        parseInt(userId), 
        organizationId ? parseInt(organizationId as string) : undefined
      );

      res.json({
        success: true,
        data: roles,
        message: 'User roles retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user roles',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /api/users/:userId/permissions
  getUserPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      const { organizationId } = req.query;

      const permissions = await this.roleService.getUserPermissions(
        parseInt(userId), 
        organizationId ? parseInt(organizationId as string) : undefined
      );

      res.json({
        success: true,
        data: permissions,
        message: 'User permissions retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve user permissions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // ============ VALIDACIONES ============

  // POST /api/roles/check-role
  checkUserRole = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, roleName, organizationId } = req.body;

      const hasRole = await this.roleService.userHasRole(userId, roleName, organizationId);

      res.json({
        success: true,
        data: { hasRole },
        message: 'Role check completed'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to check user role',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // POST /api/roles/check-permission
  checkUserPermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, permissionName, organizationId } = req.body;

      const hasPermission = await this.roleService.userHasPermission(userId, permissionName, organizationId);

      res.json({
        success: true,
        data: { hasPermission },
        message: 'Permission check completed'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to check user permission',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // POST /api/roles/check-module
  checkModuleAccess = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, module, organizationId } = req.body;

      const hasAccess = await this.roleService.userCanAccessModule(userId, module, organizationId);

      res.json({
        success: true,
        data: { hasAccess },
        message: 'Module access check completed'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to check module access',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /api/roles/my-info
  getMyRoleInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
        return;
      }

      const userId = req.user.id;
      const organizationId = req.user.organizationId;

      const [roles, permissions] = await Promise.all([
        this.roleService.getUserRoles(userId, organizationId),
        this.roleService.getUserPermissions(userId, organizationId)
      ]);

      res.json({
        success: true,
        data: {
          userId,
          organizationId,
          roles: roles.map(role => ({
            id: role.id,
            name: role.name,
            displayName: role.displayName,
            description: role.description
          })),
          permissions: permissions.map(permission => ({
            id: permission.id,
            name: permission.name,
            displayName: permission.displayName,
            module: permission.module,
            action: permission.action
          })),
          capabilities: {
            isSuperAdmin: await this.roleService.userHasRole(userId, 'super_admin'),
            isAdmin: await this.roleService.userHasRole(userId, 'admin', organizationId),
            canManageUsers: await this.roleService.userHasPermission(userId, 'users.manage', organizationId),
            canManageProperties: await this.roleService.userHasPermission(userId, 'properties.manage', organizationId),
            canManageRoles: await this.roleService.userHasPermission(userId, 'roles.create', organizationId)
          }
        },
        message: 'Role information retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve role information',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };
}