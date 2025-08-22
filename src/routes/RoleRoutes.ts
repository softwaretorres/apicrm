import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { RoleController } from '../controllers/RoleController';
import { PermissionController } from '../controllers/PermissionController';
import { 
  authenticate, 
  requirePermission, 
  requireRole,
  requireSuperAdmin,
  requireAdmin 
} from '../middlewares/AuthMiddleware';

const router = Router();
const roleController = new RoleController();
const permissionController = new PermissionController();

// ============ VALIDACIONES ============
const createRoleValidation = [
  body('name')
    .isString()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-z_]+$/)
    .withMessage('Role name must contain only lowercase letters and underscores'),
  body('displayName')
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Display name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array of permission IDs')
];

const updateRoleValidation = [
  body('displayName')
    .optional()
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Display name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const assignRoleValidation = [
  body('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  body('roleId')
    .isInt({ min: 1 })
    .withMessage('Valid role ID is required'),
  body('organizationId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Organization ID must be a valid integer'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO 8601 date')
];

const createPermissionValidation = [
  body('name')
    .isString()
    .isLength({ min: 2, max: 100 })
    .matches(/^[a-z_\.]+$/)
    .withMessage('Permission name must contain only lowercase letters, underscores, and dots'),
  body('displayName')
    .isString()
    .isLength({ min: 2, max: 100 })
    .withMessage('Display name must be between 2 and 100 characters'),
  body('module')
    .isString()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-z_]+$/)
    .withMessage('Module must contain only lowercase letters and underscores'),
  body('action')
    .isString()
    .isLength({ min: 2, max: 50 })
    .matches(/^[a-z_]+$/)
    .withMessage('Action must contain only lowercase letters and underscores'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
];

// ============ RUTAS DE ROLES ============

// Obtener todos los roles
router.get('/roles', 
  authenticate,
  requirePermission('roles.read'),
  roleController.getAllRoles
);

// Obtener rol por ID
router.get('/roles/:id',
  authenticate,
  requirePermission('roles.read'),
  param('id').isInt({ min: 1 }).withMessage('Valid role ID is required'),
  roleController.getRoleById
);

// Crear nuevo rol
router.post('/roles',
  authenticate,
  requirePermission('roles.create'),
  createRoleValidation,
  roleController.createRole
);

// Actualizar rol
router.put('/roles/:id',
  authenticate,
  requirePermission('roles.update'),
  param('id').isInt({ min: 1 }).withMessage('Valid role ID is required'),
  updateRoleValidation,
  roleController.updateRole
);

// Eliminar rol
router.delete('/roles/:id',
  authenticate,
  requirePermission('roles.delete'),
  param('id').isInt({ min: 1 }).withMessage('Valid role ID is required'),
  roleController.deleteRole
);

// ============ GESTIÓN DE PERMISOS DE ROLES ============

// Obtener permisos de un rol
router.get('/roles/:id/permissions',
  authenticate,
  requirePermission('roles.read'),
  param('id').isInt({ min: 1 }).withMessage('Valid role ID is required'),
  roleController.getRolePermissions
);

// Actualizar permisos de un rol
router.put('/roles/:id/permissions',
  authenticate,
  requirePermission('roles.update'),
  param('id').isInt({ min: 1 }).withMessage('Valid role ID is required'),
  body('permissionIds')
    .isArray()
    .withMessage('Permission IDs must be an array'),
  roleController.updateRolePermissions
);

// ============ ASIGNACIÓN DE ROLES ============

// Asignar rol a usuario
router.post('/roles/assign',
  authenticate,
  requirePermission('roles.assign'),
  assignRoleValidation,
  roleController.assignRoleToUser
);

// Remover rol de usuario
router.delete('/roles/remove',
  authenticate,
  requirePermission('roles.assign'),
  body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
  body('roleId').isInt({ min: 1 }).withMessage('Valid role ID is required'),
  body('organizationId').optional().isInt({ min: 1 }),
  roleController.removeRoleFromUser
);

// ============ CONSULTAS DE USUARIO ============

// Obtener roles de un usuario
router.get('/users/:userId/roles',
  authenticate,
  requirePermission('users.read'),
  param('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
  query('organizationId').optional().isInt({ min: 1 }),
  roleController.getUserRoles
);

// Obtener permisos de un usuario
router.get('/users/:userId/permissions',
  authenticate,
  requirePermission('users.read'),
  param('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
  query('organizationId').optional().isInt({ min: 1 }),
  roleController.getUserPermissions
);

// ============ VERIFICACIONES ============

// Verificar si usuario tiene rol
router.post('/roles/check-role',
  authenticate,
  body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
  body('roleName').isString().withMessage('Role name is required'),
  body('organizationId').optional().isInt({ min: 1 }),
  roleController.checkUserRole
);

// Verificar si usuario tiene permiso
router.post('/roles/check-permission',
  authenticate,
  body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
  body('permissionName').isString().withMessage('Permission name is required'),
  body('organizationId').optional().isInt({ min: 1 }),
  roleController.checkUserPermission
);

// Verificar acceso a módulo
router.post('/roles/check-module',
  authenticate,
  body('userId').isInt({ min: 1 }).withMessage('Valid user ID is required'),
  body('module').isString().withMessage('Module name is required'),
  body('organizationId').optional().isInt({ min: 1 }),
  roleController.checkModuleAccess
);

// Obtener información de roles del usuario autenticado
router.get('/roles/my-info',
  authenticate,
  roleController.getMyRoleInfo
);

// ============ RUTAS DE PERMISOS ============

// Obtener todos los permisos
router.get('/permissions',
  authenticate,
  requirePermission('roles.read'),
  query('module').optional().isString(),
  query('action').optional().isString(),
  query('isActive').optional().isBoolean(),
  permissionController.getAllPermissions
);

// Obtener permiso por ID
router.get('/permissions/:id',
  authenticate,
  requirePermission('roles.read'),
  param('id').isInt({ min: 1 }).withMessage('Valid permission ID is required'),
  permissionController.getPermissionById
);

// Crear nuevo permiso (solo super admin)
router.post('/permissions',
  authenticate,
  requireSuperAdmin(),
  createPermissionValidation,
  permissionController.createPermission
);

// Actualizar permiso (solo super admin)
router.put('/permissions/:id',
  authenticate,
  requireSuperAdmin(),
  param('id').isInt({ min: 1 }).withMessage('Valid permission ID is required'),
  body('displayName').optional().isString().isLength({ min: 2, max: 100 }),
  body('description').optional().isString().isLength({ max: 500 }),
  body('isActive').optional().isBoolean(),
  permissionController.updatePermission
);

// Eliminar permiso (solo super admin)
router.delete('/permissions/:id',
  authenticate,
  requireSuperAdmin(),
  param('id').isInt({ min: 1 }).withMessage('Valid permission ID is required'),
  permissionController.deletePermission
);

// ============ UTILIDADES DE PERMISOS ============

// Obtener módulos disponibles
router.get('/permissions/modules',
  authenticate,
  requirePermission('roles.read'),
  permissionController.getModules
);

// Obtener acciones disponibles
router.get('/permissions/actions',
  authenticate,
  requirePermission('roles.read'),
  query('module').optional().isString(),
  permissionController.getActions
);

// Obtener permisos por módulo
router.get('/permissions/by-module/:module',
  authenticate,
  requirePermission('roles.read'),
  param('module').isString().withMessage('Module name is required'),
  permissionController.getPermissionsByModule
);

// Crear múltiples permisos (solo super admin)
router.post('/permissions/bulk-create',
  authenticate,
  requireSuperAdmin(),
  body('permissions')
    .isArray({ min: 1 })
    .withMessage('Permissions array is required'),
  permissionController.bulkCreatePermissions
);

export default router;