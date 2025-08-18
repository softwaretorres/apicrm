import { Router } from 'express';
import { UserController } from '@/controllers/UserController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { apiRateLimit } from '@/middlewares/RateLimitMiddleware';

const router = Router();
const userController = new UserController();
const authMiddleware = new AuthMiddleware();

// Aplicar autenticación a todas las rutas de usuarios
router.use(authMiddleware.authenticate);

// Aplicar rate limiting
router.use(apiRateLimit);

// Rutas de estadísticas (antes de las rutas con parámetros)
router.get('/stats', userController.getUserStats);
router.get('/search', userController.searchUsers);
router.get('/recent', userController.getRecentlyActiveUsers);

// CRUD de usuarios
router.get('/', userController.getUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Acciones especiales
router.patch('/:id/toggle', userController.toggleUserStatus);

export default router;