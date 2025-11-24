import { Router } from 'express';
import { GoogleDriveController } from '../controllers/GoogleDriveController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { apiRateLimit } from '../middlewares/RateLimitMiddleware';

const router = Router();
const googleDriveController = new GoogleDriveController();
const authMiddleware = new AuthMiddleware();

// Aplicar autenticación a todas las rutas
router.use(authMiddleware.authenticate);

// Aplicar rate limiting
router.use(apiRateLimit);

/**
 * @swagger
 * tags:
 *   name: GoogleDrive
 *   description: Endpoints para integración con Google Drive
 */

/**
 * @swagger
 * /google-drive/status:
 *   get:
 *     summary: Obtener estado de conexión con Google Drive
 *     tags: [GoogleDrive]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de conexión
 */
router.get('/status', googleDriveController.getStatus);

/**
 * @swagger
 * /google-drive/connect:
 *   get:
 *     summary: Obtener URL de autorización de Google o completar conexión
 *     tags: [GoogleDrive]
 *     security:
 *       - bearerAuth: []
 */
router.get('/connect', googleDriveController.connect);

/**
 * @swagger
 * /google-drive/connect:
 *   post:
 *     summary: Conectar con Google Drive usando accessToken
 *     tags: [GoogleDrive]
 *     security:
 *       - bearerAuth: []
 */
router.post('/connect', googleDriveController.connect);

/**
 * @swagger
 * /google-drive/disconnect:
 *   post:
 *     summary: Desconectar Google Drive
 *     tags: [GoogleDrive]
 *     security:
 *       - bearerAuth: []
 */
router.post('/disconnect', googleDriveController.disconnect);

/**
 * @swagger
 * /google-drive/files:
 *   get:
 *     summary: Listar archivos de Google Drive
 *     tags: [GoogleDrive]
 *     security:
 *       - bearerAuth: []
 */
router.get('/files', googleDriveController.getFiles);

/**
 * @swagger
 * /google-drive/files/{id}:
 *   get:
 *     summary: Obtener información de un archivo específico
 *     tags: [GoogleDrive]
 *     security:
 *       - bearerAuth: []
 */
router.get('/files/:id', googleDriveController.getFile);

/**
 * @swagger
 * /google-drive/files/{fileId}/download:
 *   get:
 *     summary: Descargar archivo de Google Drive (autenticado)
 *     tags: [GoogleDrive]
 *     security:
 *       - bearerAuth: []
 */
router.get('/files/:fileId/download', googleDriveController.downloadFile);

/**
 * @swagger
 * /google-drive/files/{fileId}/share-token:
 *   post:
 *     summary: Crear token de compartición para un archivo
 *     tags: [GoogleDrive]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expirationDays:
 *                 type: number
 *                 description: Días hasta que expire el token (default 365)
 *                 example: 365
 *     responses:
 *       200:
 *         description: Token creado exitosamente
 */
router.post('/files/:fileId/share-token', googleDriveController.createShareToken);

/**
 * @swagger
 * /google-drive/share-tokens:
 *   get:
 *     summary: Listar todos los tokens de compartición del usuario
 *     tags: [GoogleDrive]
 *     security:
 *       - bearerAuth: []
 */
router.get('/share-tokens', googleDriveController.listShareTokens);

/**
 * @swagger
 * /google-drive/share-tokens/{token}:
 *   delete:
 *     summary: Revocar un token de compartición
 *     tags: [GoogleDrive]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/share-tokens/:token', googleDriveController.revokeShareToken);

/**
 * @swagger
 * /google-drive/share-tokens/{token}/stats:
 *   get:
 *     summary: Obtener estadísticas de un token
 *     tags: [GoogleDrive]
 *     security:
 *       - bearerAuth: []
 */
router.get('/share-tokens/:token/stats', googleDriveController.getShareTokenStats);

/**
 * @swagger
 * /google-drive/folders:
 *   get:
 *     summary: Listar carpetas de Google Drive
 *     tags: [GoogleDrive]
 *     security:
 *       - bearerAuth: []
 */
router.get('/folders', googleDriveController.getFolders);

/**
 * @swagger
 * /google-drive/folders/{id}:
 *   get:
 *     summary: Obtener información de una carpeta específica
 *     tags: [GoogleDrive]
 *     security:
 *       - bearerAuth: []
 */
router.get('/folders/:id', googleDriveController.getFolder);

export default router;