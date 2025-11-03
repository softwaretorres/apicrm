import { Router } from 'express';
import { CatalogController } from '../controllers/CatalogController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { apiRateLimit } from '../middlewares/RateLimitMiddleware';

const router = Router();
const catalogController = new CatalogController();


const authMiddleware = new AuthMiddleware();

// Aplicar autenticación a todas las rutas de usuarios
router.use(authMiddleware.authenticate);

// Aplicar rate limiting
router.use(apiRateLimit);
/**
 * @swagger
 * tags:
 *   name: Catalogs
 *   description: Endpoints para obtener catálogos relacionados con propiedades
 */

/**
 * @swagger
 * /catalogs/all:
 *   get:
 *     summary: Obtener todos los catálogos
 *     tags: [Catalogs]
 *     responses:
 *       200:
 *         description: Lista completa de catálogos
 */
router.get('/all', catalogController.getAllCatalogs);

/**
 * @swagger
 * /catalogs/property-types:
 *   get:
 *     summary: Obtener lista de tipos de propiedad
 *     tags: [Catalogs]
 *     responses:
 *       200:
 *         description: Lista de tipos de propiedad
 */
router.get('/property-types', catalogController.getPropertyTypes);

/**
 * @swagger
 * /catalogs/property-types/{id}:
 *   get:
 *     summary: Obtener un tipo de propiedad por ID
 *     tags: [Catalogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del tipo de propiedad
 *     responses:
 *       200:
 *         description: Tipo de propiedad encontrado
 */
router.get('/property-types/:id', catalogController.getPropertyType);

/**
 * @swagger
 * /catalogs/property-types:
 *   post:
 *     summary: Crear un nuevo tipo de propiedad
 *     tags: [Catalogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tipo de propiedad creado
 */
router.post('/property-types', catalogController.createPropertyType);

/**
 * @swagger
 * /catalogs/property-types/{id}:
 *   put:
 *     summary: Actualizar un tipo de propiedad
 *     tags: [Catalogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Tipo de propiedad actualizado
 */
router.put('/property-types/:id', catalogController.updatePropertyType);

/**
 * @swagger
 * /catalogs/property-types/{id}:
 *   delete:
 *     summary: Eliminar un tipo de propiedad
 *     tags: [Catalogs]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *     responses:
 *       200:
 *         description: Tipo de propiedad eliminado
 */
router.delete('/property-types/:id', catalogController.deletePropertyType);

/**
 * @swagger
 * /catalogs/property-statuses:
 *   get:
 *     summary: Obtener lista de estados de propiedad
 *     tags: [Catalogs]
 *     responses:
 *       200:
 *         description: Lista de estados de propiedad
 */
router.get('/property-statuses', catalogController.getPropertyStatuses);

/**
 * @swagger
 * /catalogs/property-statuses:
 *   post:
 *     summary: Crear un nuevo estado de propiedad
 *     tags: [Catalogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               color:
 *                 type: string
 *     responses:
 *       201:
 *         description: Estado de propiedad creado
 */
router.post('/property-statuses', catalogController.createPropertyStatus);

/**
 * @swagger
 * /catalogs/transaction-types:
 *   get:
 *     summary: Obtener lista de tipos de transacción
 *     tags: [Catalogs]
 *     responses:
 *       200:
 *         description: Lista de tipos de transacción
 */
router.get('/transaction-types', catalogController.getTransactionTypes);

/**
 * @swagger
 * /catalogs/transaction-types:
 *   post:
 *     summary: Crear un tipo de transacción
 *     tags: [Catalogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tipo de transacción creado
 */
router.post('/transaction-types', catalogController.createTransactionType);

/**
 * @swagger
 * /catalogs/property-conditions:
 *   get:
 *     summary: Obtener lista de condiciones de propiedad
 *     tags: [Catalogs]
 *     responses:
 *       200:
 *         description: Lista de condiciones de propiedad
 */
router.get('/property-conditions', catalogController.getPropertyConditions);

/**
 * @swagger
 * /catalogs/property-conditions:
 *   post:
 *     summary: Crear condición de propiedad
 *     tags: [Catalogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       201:
 *         description: Condición creada
 */
router.post('/property-conditions', catalogController.createPropertyCondition);

/**
 * @swagger
 * /catalogs/property-features:
 *   get:
 *     summary: Obtener lista de características de propiedad
 *     tags: [Catalogs]
 *     responses:
 *       200:
 *         description: Lista de características de propiedad
 */
router.get('/property-features', catalogController.getPropertyFeatures);

/**
 * @swagger
 * /catalogs/property-features:
 *   post:
 *     summary: Crear característica de propiedad
 *     tags: [Catalogs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               category:
 *                 type: string
 *               options:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Característica creada
 */
router.post('/property-features', catalogController.createPropertyFeature);

export default router;
