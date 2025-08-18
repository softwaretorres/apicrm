import { Router } from 'express';
import { AuthController } from '@/controllers/AuthController';
import { AuthMiddleware } from '@/middlewares/AuthMiddleware';
import { rateLimitMiddleware } from '@/middlewares/RateLimitMiddleware';

const router = Router();
const authController = new AuthController();
const authMiddleware = new AuthMiddleware();

/**
 * @swagger
 * /api/v1/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y retorna tokens de acceso
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Login successful"
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         description: Muchos intentos de login
 */
router.post('/login', rateLimitMiddleware, authController.login);

/**
 * @swagger
 * /api/v1/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     description: Crea una nueva cuenta de usuario
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Registration successful"
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/register', rateLimitMiddleware, authController.register);

/**
 * @swagger
 * /api/v1/auth/password/reset-request:
 *   post:
 *     summary: Solicitar restablecimiento de contraseña
 *     description: Envía un email con enlace para restablecer contraseña
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: usuario@ejemplo.com
 *     responses:
 *       200:
 *         description: Email de restablecimiento enviado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "If the email exists, a password reset link has been sent"
 */
router.post('/password/reset-request', rateLimitMiddleware, authController.requestPasswordReset);

/**
 * @swagger
 * /api/v1/auth/password/reset:
 *   post:
 *     summary: Restablecer contraseña
 *     description: Restablece la contraseña usando el token enviado por email
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - password
 *               - password_confirmation
 *             properties:
 *               token:
 *                 type: string
 *                 example: "reset-token-here"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "NuevaPassword123!"
 *               password_confirmation:
 *                 type: string
 *                 format: password
 *                 example: "NuevaPassword123!"
 *     responses:
 *       200:
 *         description: Contraseña restablecida exitosamente
 *       400:
 *         description: Token inválido o expirado
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/password/reset', rateLimitMiddleware, authController.resetPassword);

/**
 * @swagger
 * /api/v1/auth/email/verify:
 *   post:
 *     summary: Verificar email
 *     description: Verifica la dirección de email del usuario
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 example: "verification-token-here"
 *     responses:
 *       200:
 *         description: Email verificado exitosamente
 *       400:
 *         description: Token de verificación inválido
 */
router.post('/email/verify', authController.verifyEmail);

/**
 * @swagger
 * /api/v1/auth/refresh:
 *   post:
 *     summary: Refrescar token de acceso
 *     description: Obtiene un nuevo access token usando el refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refresh_token
 *             properties:
 *               refresh_token:
 *                 type: string
 *                 example: "refresh-token-here"
 *     responses:
 *       200:
 *         description: Token refrescado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Token refreshed successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Refresh token inválido
 */
router.post('/refresh', authController.refreshToken);

// Rutas protegidas (requieren autenticación)
router.use(authMiddleware.authenticate);

/**
 * @swagger
 * /api/v1/auth/me:
 *   get:
 *     summary: Obtener información del usuario autenticado
 *     description: Retorna los datos del usuario actualmente autenticado
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Información del usuario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "User information retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', authController.me);

/**
 * @swagger
 * /api/v1/auth/profile:
 *   put:
 *     summary: Actualizar perfil del usuario
 *     description: Actualiza la información del perfil del usuario autenticado
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Juan Pérez"
 *               firstName:
 *                 type: string
 *                 example: "Juan"
 *               lastName:
 *                 type: string
 *                 example: "Pérez"
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               avatar:
 *                 type: string
 *                 example: "https://ejemplo.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: Perfil actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Profile updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/profile', authController.updateProfile);

/**
 * @swagger
 * /api/v1/auth/password/change:
 *   post:
 *     summary: Cambiar contraseña
 *     description: Cambia la contraseña del usuario autenticado
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - current_password
 *               - new_password
 *               - new_password_confirmation
 *             properties:
 *               current_password:
 *                 type: string
 *                 format: password
 *                 example: "PasswordActual123!"
 *               new_password:
 *                 type: string
 *                 format: password
 *                 example: "NuevaPassword123!"
 *               new_password_confirmation:
 *                 type: string
 *                 format: password
 *                 example: "NuevaPassword123!"
 *     responses:
 *       200:
 *         description: Contraseña cambiada exitosamente
 *       400:
 *         description: Contraseña actual incorrecta
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       422:
 *         $ref: '#/components/responses/ValidationError'
 */
router.post('/password/change', authController.changePassword);

/**
 * @swagger
 * /api/v1/auth/logout:
 *   post:
 *     summary: Cerrar sesión
 *     description: Invalida el token de acceso actual
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesión cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logout successful"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout', authController.logout);

/**
 * @swagger
 * /api/v1/auth/logout-all:
 *   post:
 *     summary: Cerrar sesión en todos los dispositivos
 *     description: Invalida todos los tokens de acceso del usuario
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sesiones cerradas en todos los dispositivos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Logged out from all devices successfully"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/logout-all', authController.logoutAll);

export default router;