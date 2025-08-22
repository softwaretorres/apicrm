import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Permission } from '../entities/Permission';
import { validationResult } from 'express-validator';
import { CreatePermissionDTO, UpdatePermissionDTO } from '../types';

export class PermissionController {
  private permissionRepository: Repository<Permission>;

  constructor() {
    this.permissionRepository = AppDataSource.getRepository(Permission);
  }

  // GET /api/permissions
  getAllPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { module, action, isActive } = req.query;

      const queryBuilder = this.permissionRepository.createQueryBuilder('permission');

      if (module) {
        queryBuilder.andWhere('permission.module = :module', { module });
      }

      if (action) {
        queryBuilder.andWhere('permission.action = :action', { action });
      }

      if (isActive !== undefined) {
        queryBuilder.andWhere('permission.isActive = :isActive', { isActive: isActive === 'true' });
      }

      queryBuilder.orderBy('permission.module', 'ASC')
        .addOrderBy('permission.action', 'ASC');

      const permissions = await queryBuilder.getMany();

      // Agrupar por módulos para mejor organización
      const permissionsByModule = permissions.reduce((acc, permission) => {
        if (!acc[permission.module]) {
          acc[permission.module] = [];
        }
        acc[permission.module].push(permission);
        return acc;
      }, {} as Record<string, Permission[]>);

      res.json({
        success: true,
        data: {
          permissions,
          permissionsByModule,
          totalCount: permissions.length,
          moduleCount: Object.keys(permissionsByModule).length
        },
        message: 'Permissions retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve permissions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /api/permissions/:id
  getPermissionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const permission = await this.permissionRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['rolePermissions', 'rolePermissions.role']
      });

      if (!permission) {
        res.status(404).json({
          success: false,
          message: 'Permission not found'
        });
        return;
      }

      res.json({
        success: true,
        data: permission,
        message: 'Permission retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve permission',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // POST /api/permissions
  createPermission = async (req: Request, res: Response): Promise<void> => {
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

      const permissionData: CreatePermissionDTO = req.body;

      // Verificar si ya existe un permiso con el mismo nombre
      const existingPermission = await this.permissionRepository.findOne({
        where: { name: permissionData.name }
      });

      if (existingPermission) {
        res.status(409).json({
          success: false,
          message: `Permission with name '${permissionData.name}' already exists`
        });
        return;
      }

      const permission = this.permissionRepository.create(permissionData);
      const savedPermission = await this.permissionRepository.save(permission);

      res.status(201).json({
        success: true,
        data: savedPermission,
        message: 'Permission created successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create permission',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // PUT /api/permissions/:id
  updatePermission = async (req: Request, res: Response): Promise<void> => {
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
      const updateData: UpdatePermissionDTO = req.body;

      const permission = await this.permissionRepository.findOne({
        where: { id: parseInt(id) }
      });

      if (!permission) {
        res.status(404).json({
          success: false,
          message: 'Permission not found'
        });
        return;
      }

      await this.permissionRepository.update(parseInt(id), updateData);

      const updatedPermission = await this.permissionRepository.findOne({
        where: { id: parseInt(id) }
      });

      res.json({
        success: true,
        data: updatedPermission,
        message: 'Permission updated successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to update permission',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // DELETE /api/permissions/:id
  deletePermission = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const permission = await this.permissionRepository.findOne({
        where: { id: parseInt(id) },
        relations: ['rolePermissions']
      });

      if (!permission) {
        res.status(404).json({
          success: false,
          message: 'Permission not found'
        });
        return;
      }

      // Verificar si el permiso está siendo usado en algún rol
      if (permission.rolePermissions && permission.rolePermissions.length > 0) {
        const activeRolePermissions = permission.rolePermissions.filter(rp => rp.isActive);
        if (activeRolePermissions.length > 0) {
          res.status(409).json({
            success: false,
            message: 'Cannot delete permission that is assigned to roles',
            data: {
              assignedRolesCount: activeRolePermissions.length
            }
          });
          return;
        }
      }

      await this.permissionRepository.delete(parseInt(id));

      res.json({
        success: true,
        message: 'Permission deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete permission',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /api/permissions/modules
  getModules = async (req: Request, res: Response): Promise<void> => {
    try {
      const modules = await this.permissionRepository
        .createQueryBuilder('permission')
        .select('DISTINCT permission.module', 'module')
        .where('permission.isActive = :isActive', { isActive: true })
        .orderBy('permission.module', 'ASC')
        .getRawMany();

      const moduleList = modules.map(m => m.module);

      res.json({
        success: true,
        data: {
          modules: moduleList,
          count: moduleList.length
        },
        message: 'Modules retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve modules',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /api/permissions/actions
  getActions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { module } = req.query;

      let queryBuilder = this.permissionRepository
        .createQueryBuilder('permission')
        .select('DISTINCT permission.action', 'action')
        .where('permission.isActive = :isActive', { isActive: true });

      if (module) {
        queryBuilder = queryBuilder.andWhere('permission.module = :module', { module });
      }

      const actions = await queryBuilder
        .orderBy('permission.action', 'ASC')
        .getRawMany();

      const actionList = actions.map(a => a.action);

      res.json({
        success: true,
        data: {
          actions: actionList,
          count: actionList.length,
          module: module || 'all'
        },
        message: 'Actions retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve actions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // GET /api/permissions/by-module/:module
  getPermissionsByModule = async (req: Request, res: Response): Promise<void> => {
    try {
      const { module } = req.params;

      const permissions = await this.permissionRepository.find({
        where: {
          module,
          isActive: true
        },
        order: { action: 'ASC' }
      });

      if (permissions.length === 0) {
        res.status(404).json({
          success: false,
          message: `No permissions found for module '${module}'`
        });
        return;
      }

      // Agrupar por acciones para facilitar el uso
      const permissionsByAction = permissions.reduce((acc, permission) => {
        acc[permission.action] = permission;
        return acc;
      }, {} as Record<string, Permission>);

      res.json({
        success: true,
        data: {
          module,
          permissions,
          permissionsByAction,
          count: permissions.length
        },
        message: `Permissions for module '${module}' retrieved successfully`
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve permissions by module',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  // POST /api/permissions/bulk-create
  bulkCreatePermissions = async (req: Request, res: Response): Promise<void> => {
    const queryRunner = this.permissionRepository.manager.connection.createQueryRunner();

    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors.array()
        });
        return;
      }

      const { permissions } = req.body;

      if (!Array.isArray(permissions) || permissions.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Permissions array is required and cannot be empty'
        });
        return;
      }

      await queryRunner.connect();
      await queryRunner.startTransaction();

      const createdPermissions: Permission[] = [];
      const errors: string[] = [];

      for (const permissionData of permissions) {
        try {
          // Verificar si ya existe
          const existing = await queryRunner.manager.findOne(Permission, {
            where: { name: permissionData.name }
          });

          if (existing) {
            errors.push(`Permission '${permissionData.name}' already exists`);
            continue;
          }

          const permission = queryRunner.manager.create(Permission, permissionData);
          const saved = await queryRunner.manager.save(permission);
          createdPermissions.push(saved);
        } catch (error) {
          errors.push(`Failed to create permission '${permissionData.name}': ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      await queryRunner.commitTransaction();

      res.status(201).json({
        success: true,
        data: {
          createdPermissions,
          createdCount: createdPermissions.length,
          totalRequested: permissions.length,
          errors
        },
        message: `Bulk creation completed. ${createdPermissions.length} permissions created${errors.length > 0 ? ` with ${errors.length} errors` : ''}`
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      res.status(500).json({
        success: false,
        message: 'Failed to bulk create permissions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      await queryRunner.release();
    }
  };
}