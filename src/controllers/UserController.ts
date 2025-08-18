import { Request, Response } from 'express';
import { UserService, UserFilters } from '@/services/UserService';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class UserController {
  private userService = new UserService();

  /**
   * Obtener lista de usuarios con filtros y paginación
   */
  public getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters: UserFilters = {
        search: req.query.search as string,
        active: req.query.active === 'true' ? true : req.query.active === 'false' ? false : undefined,
        verified: req.query.verified === 'true' ? true : req.query.verified === 'false' ? false : undefined,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10,
        sortBy: req.query.sortBy as any || 'id',
        sortOrder: req.query.sortOrder as 'ASC' | 'DESC' || 'DESC'
      };

      // Validar límite máximo
      if (filters.limit! > 100) {
        filters.limit = 100;
      }

      const result = await this.userService.getUsers(filters);

      res.status(200).json({
        message: 'Users retrieved successfully',
        data: result.data,
        meta: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        message: 'Failed to retrieve users',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Obtener usuario por ID
   */
  public getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({
          message: 'Invalid user ID'
        });
        return;
      }

      const user = await this.userService.findById(userId);

      if (!user) {
        res.status(404).json({
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        message: 'User retrieved successfully',
        data: user.toJSON()
      });
    } catch (error) {
      console.error('Get user by ID error:', error);
      res.status(500).json({
        message: 'Failed to retrieve user',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Crear nuevo usuario
   */
  public createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, password, firstName, lastName, phone, active } = req.body;

      // Validaciones básicas
      const errors: any = {};
      if (!name) errors.name = ['Name is required'];
      if (!email) errors.email = ['Email is required'];
      if (!password) errors.password = ['Password is required'];
      if (password && password.length < 6) {
        errors.password = errors.password || [];
        errors.password.push('Password must be at least 6 characters');
      }

      if (Object.keys(errors).length > 0) {
        res.status(422).json({
          message: 'Validation failed',
          errors
        });
        return;
      }

      // Verificar si el email ya existe
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        res.status(422).json({
          message: 'Validation failed',
          errors: {
            email: ['Email already exists']
          }
        });
        return;
      }

      const userData = {
        name,
        email,
        password,
        firstName,
        lastName,
        phone,
        active: active !== undefined ? active : true
      };

      const user = await this.userService.createUser(userData);

      res.status(201).json({
        message: 'User created successfully',
        data: user.toJSON()
      });
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({
        message: 'Failed to create user',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Actualizar usuario
   */
  public updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({
          message: 'Invalid user ID'
        });
        return;
      }

      const { name, email, firstName, lastName, phone, active } = req.body;

      // Verificar si el usuario existe
      const existingUser = await this.userService.findById(userId);
      if (!existingUser) {
        res.status(404).json({
          message: 'User not found'
        });
        return;
      }

      // Si se está actualizando el email, verificar que no exista
      if (email && email !== existingUser.email) {
        const emailExists = await this.userService.findByEmail(email);
        if (emailExists) {
          res.status(422).json({
            message: 'Validation failed',
            errors: {
              email: ['Email already exists']
            }
          });
          return;
        }
      }

      const updateData = {
        name,
        email,
        firstName,
        lastName,
        phone,
        active
      };

      // Remover campos undefined
      Object.keys(updateData).forEach(key => {
        if ((updateData as any)[key] === undefined) {
          delete (updateData as any)[key];
        }
      });

      const updatedUser = await this.userService.updateUser(userId, updateData);

      res.status(200).json({
        message: 'User updated successfully',
        data: updatedUser!.toJSON()
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        message: 'Failed to update user',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Eliminar usuario (soft delete)
   */
  public deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({
          message: 'Invalid user ID'
        });
        return;
      }

      const success = await this.userService.deleteUser(userId);

      if (!success) {
        res.status(404).json({
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        message: 'Failed to delete user',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Activar/Desactivar usuario
   */
  public toggleUserStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({
          message: 'Invalid user ID'
        });
        return;
      }

      const updatedUser = await this.userService.toggleUserStatus(userId);

      if (!updatedUser) {
        res.status(404).json({
          message: 'User not found'
        });
        return;
      }

      res.status(200).json({
        message: `User ${updatedUser.active ? 'activated' : 'deactivated'} successfully`,
        data: updatedUser.toJSON()
      });
    } catch (error) {
      console.error('Toggle user status error:', error);
      res.status(500).json({
        message: 'Failed to toggle user status',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Obtener estadísticas de usuarios
   */
  public getUserStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.userService.getUserStats();

      res.status(200).json({
        message: 'User statistics retrieved successfully',
        data: stats
      });
    } catch (error) {
      console.error('Get user stats error:', error);
      res.status(500).json({
        message: 'Failed to retrieve user statistics',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Buscar usuarios
   */
  public searchUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, email, phone, active } = req.query;

      const criteria = {
        name: name as string,
        email: email as string,
        phone: phone as string,
        active: active === 'true' ? true : active === 'false' ? false : undefined
      };

      // Remover campos vacíos
      Object.keys(criteria).forEach(key => {
        if ((criteria as any)[key] === undefined || (criteria as any)[key] === '') {
          delete (criteria as any)[key];
        }
      });

      if (Object.keys(criteria).length === 0) {
        res.status(400).json({
          message: 'At least one search criteria is required'
        });
        return;
      }

      const users = await this.userService.searchUsers(criteria);

      res.status(200).json({
        message: 'Search completed successfully',
        data: users.map(user => user.toJSON()),
        count: users.length
      });
    } catch (error) {
      console.error('Search users error:', error);
      res.status(500).json({
        message: 'Failed to search users',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };

  /**
   * Obtener usuarios activos recientemente
   */
  public getRecentlyActiveUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      const days = parseInt(req.query.days as string) || 7;

      if (days < 1 || days > 365) {
        res.status(400).json({
          message: 'Days parameter must be between 1 and 365'
        });
        return;
      }

      const users = await this.userService.getRecentlyActiveUsers(days);

      res.status(200).json({
        message: 'Recently active users retrieved successfully',
        data: users.map(user => user.toJSON()),
        count: users.length,
        period: `${days} days`
      });
    } catch (error) {
      console.error('Get recently active users error:', error);
      res.status(500).json({
        message: 'Failed to retrieve recently active users',
        error: error instanceof Error ? error.message : 'Internal server error'
      });
    }
  };
}