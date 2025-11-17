import { Router } from 'express';
import authRoutes from './AuthRoutes';
import userRoutes from './UserRoutes';
import catalogRoutes from './CatalogRoutes';
import propertyRoutes from './PropertyRoutes';
import  GoogleDriveRoutes  from './GoogleDriveRoutes';
import { GoogleDriveController } from '../controllers/GoogleDriveController';



/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health Check
 *     description: Verifica el estado de salud del servicio
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Servicio funcionando correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2023-01-01T00:00:00.000Z"
 *                 service:
 *                   type: string
 *                   example: "auth-service"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 environment:
 *                   type: string
 *                   example: "development"
 *             example:
 *               status: "OK"
 *               timestamp: "2023-01-01T00:00:00.000Z"
 *               service: "auth-service"
 *               version: "1.0.0"
 *               environment: "development"
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Información de la API
 *     description: Retorna información básica sobre la API y enlaces útiles
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Información de la API
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Node.js Microservice - Laravel Passport Compatible"
 *                 version:
 *                   type: string
 *                   example: "v1"
 *                 documentation:
 *                   type: string
 *                   example: "/api/v1/docs"
 *                 health:
 *                   type: string
 *                   example: "/health"
 */

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);
router.use('/catalogs', catalogRoutes);
router.use('/properties', propertyRoutes);
router.use('/ndrive', GoogleDriveRoutes);

// Rutas de usuarios
router.use('/users', userRoutes);

// Ruta de documentación/info de la API
const googleDriveController = new GoogleDriveController();

router.get('/', (req, res) => {
  res.json({
    message: 'Ndrive',
    version: '1.0.0',
    endpoints: {
      auth: {
        login: 'POST /auth/login',
        register: 'POST /auth/register',
        logout: 'POST /auth/logout',
        me: 'GET /auth/me',
        refresh: 'POST /auth/refresh',
        passwordReset: 'POST /auth/password/reset-request',
        passwordResetConfirm: 'POST /auth/password/reset',
        changePassword: 'POST /auth/password/change'
      },
      users: {
        list: 'GET /users',
        create: 'POST /users',
        show: 'GET /users/:id',
        update: 'PUT /users/:id',
        delete: 'DELETE /users/:id',
        toggle: 'PATCH /users/:id/toggle',
        stats: 'GET /users/stats',
        search: 'GET /users/search',
        recent: 'GET /users/recent'
      }
    },
    documentation: 'https://github.com/tu-usuario/tu-repo/blob/main/README.md'
  });
});

export default router;
