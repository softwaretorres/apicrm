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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     connected:
 *                       type: boolean
 *                     email:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 */
router.get('/status', googleDriveController.getStatus);
router.get('/files/:fileId/download',  googleDriveController.downloadFile);
router.post('/files/:fileId/share',  googleDriveController.createPublicLink);
/**
 * @swagger
 * /google-drive/connect:
 *   get:
 *     summary: Obtener URL de autorización de Google o completar conexión
 *     tags: [GoogleDrive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Código de autorización de Google OAuth
 *     responses:
 *       200:
 *         description: URL de autorización o confirmación de conexión
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               accessToken:
 *                 type: string
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conexión exitosa
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
 *     responses:
 *       200:
 *         description: Desconexión exitosa
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
 *     parameters:
 *       - in: query
 *         name: folderId
 *         schema:
 *           type: string
 *         description: ID de la carpeta
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número de resultados por página
 *       - in: query
 *         name: pageToken
 *         schema:
 *           type: string
 *         description: Token de paginación
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         description: Query de búsqueda de Google Drive
 *       - in: query
 *         name: orderBy
 *         schema:
 *           type: string
 *         description: Campo de ordenamiento
 *     responses:
 *       200:
 *         description: Lista de archivos
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID del archivo
 *     responses:
 *       200:
 *         description: Información del archivo
 */
router.get('/files/:id', googleDriveController.getFile);

/**
 * @swagger
 * /google-drive/folders:
 *   get:
 *     summary: Listar carpetas de Google Drive
 *     tags: [GoogleDrive]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: string
 *         description: ID de la carpeta padre
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Número de resultados por página
 *       - in: query
 *         name: pageToken
 *         schema:
 *           type: string
 *         description: Token de paginación
 *     responses:
 *       200:
 *         description: Lista de carpetas
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
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de la carpeta
 *     responses:
 *       200:
 *         description: Información de la carpeta
 */
router.get('/folders/:id', googleDriveController.getFolder);

export default router;
