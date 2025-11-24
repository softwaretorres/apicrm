// src/routes/PublicRoutes.ts
import { Router } from 'express';
import { GoogleDriveController } from '../controllers/GoogleDriveController';

const router = Router();
const googleDriveController = new GoogleDriveController();

/**
 * @swagger
 * tags:
 *   name: Public
 *   description: Endpoints públicos sin autenticación
 */

/**
 * @swagger
 * /public/download/{token}:
 *   get:
 *     summary: Descargar archivo mediante token de compartición (SIN autenticación)
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de compartición
 *     responses:
 *       200:
 *         description: Archivo descargado
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Link inválido o no encontrado
 *       410:
 *         description: Link expirado
 */
router.get('/download/:token', googleDriveController.downloadFileByToken);

/**
 * @swagger
 * /public/view/{token}:
 *   get:
 *     summary: Visualizar archivo en el navegador mediante token (SIN autenticación)
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: Token de compartición
 *     responses:
 *       200:
 *         description: Archivo visualizado
 *       404:
 *         description: Link inválido o no encontrado
 *       410:
 *         description: Link expirado
 */
router.get('/view/:token', googleDriveController.viewFileByToken);

export default router;