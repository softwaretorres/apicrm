/**
 * @swagger
 * components:
 *   schemas:
 *     Property:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la propiedad
 *         title:
 *           type: string
 *           description: Título de la propiedad
 *         description:
 *           type: string
 *           description: Descripción detallada de la propiedad
 *         userId:
 *           type: integer
 *           description: ID del usuario propietario
 *         propertyTypeId:
 *           type: integer
 *           description: ID del tipo de propiedad
 *         propertyStatusId:
 *           type: integer
 *           description: ID del estado de la propiedad
 *         transactionTypeId:
 *           type: integer
 *           description: ID del tipo de transacción
 *         propertyConditionId:
 *           type: integer
 *           description: ID de la condición de la propiedad
 *         address:
 *           type: string
 *           description: Dirección de la propiedad
 *         city:
 *           type: string
 *           description: Ciudad
 *         state:
 *           type: string
 *           description: Estado/Departamento
 *         zipCode:
 *           type: string
 *           description: Código postal
 *         country:
 *           type: string
 *           description: País
 *         latitude:
 *           type: number
 *           format: float
 *           description: Latitud geográfica
 *         longitude:
 *           type: number
 *           format: float
 *           description: Longitud geográfica
 *         price:
 *           type: number
 *           format: decimal
 *           description: Precio de la propiedad
 *         currency:
 *           type: string
 *           description: Moneda del precio
 *           default: COP
 *         totalArea:
 *           type: number
 *           format: decimal
 *           description: Área total en metros cuadrados
 *         builtArea:
 *           type: number
 *           format: decimal
 *           description: Área construida en metros cuadrados
 *         bedrooms:
 *           type: integer
 *           description: Número de habitaciones
 *         bathrooms:
 *           type: integer
 *           description: Número de baños
 *         parkingSpaces:
 *           type: integer
 *           description: Número de espacios de parqueo
 *         yearBuilt:
 *           type: integer
 *           description: Año de construcción
 *         isActive:
 *           type: boolean
 *           description: Si la propiedad está activa
 *         isFeatured:
 *           type: boolean
 *           description: Si la propiedad está destacada
 *         isPublished:
 *           type: boolean
 *           description: Si la propiedad está publicada
 *         publishedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de publicación
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 *     
 *     PropertyFilters:
 *       type: object
 *       properties:
 *         search:
 *           type: string
 *           description: Texto de búsqueda en título y descripción
 *         propertyTypeId:
 *           type: integer
 *           description: Filtrar por tipo de propiedad
 *         propertyStatusId:
 *           type: integer
 *           description: Filtrar por estado de la propiedad
 *         transactionTypeId:
 *           type: integer
 *           description: Filtrar por tipo de transacción
 *         propertyConditionId:
 *           type: integer
 *           description: Filtrar por condición de la propiedad
 *         city:
 *           type: string
 *           description: Filtrar por ciudad
 *         state:
 *           type: string
 *           description: Filtrar por estado/departamento
 *         country:
 *           type: string
 *           description: Filtrar por país
 *         minPrice:
 *           type: number
 *           description: Precio mínimo
 *         maxPrice:
 *           type: number
 *           description: Precio máximo
 *         minArea:
 *           type: number
 *           description: Área mínima en m²
 *         maxArea:
 *           type: number
 *           description: Área máxima en m²
 *         bedrooms:
 *           type: integer
 *           description: Número de habitaciones
 *         bathrooms:
 *           type: integer
 *           description: Número de baños
 *         parkingSpaces:
 *           type: integer
 *           description: Número de espacios de parqueo
 *         isPublished:
 *           type: boolean
 *           description: Solo propiedades publicadas
 *         isFeatured:
 *           type: boolean
 *           description: Solo propiedades destacadas
 *         userId:
 *           type: integer
 *           description: Filtrar por propietario
 *     
 *     CreatePropertyRequest:
 *       type: object
 *       required:
 *         - property
 *       properties:
 *         property:
 *           type: object
 *           required:
 *             - title
 *             - price
 *             - propertyTypeId
 *             - propertyStatusId
 *             - transactionTypeId
 *             - propertyConditionId
 *           properties:
 *             title:
 *               type: string
 *               description: Título de la propiedad
 *             description:
 *               type: string
 *               description: Descripción de la propiedad
 *             price:
 *               type: number
 *               description: Precio de la propiedad
 *             propertyTypeId:
 *               type: integer
 *               description: ID del tipo de propiedad
 *             propertyStatusId:
 *               type: integer
 *               description: ID del estado de la propiedad
 *             transactionTypeId:
 *               type: integer
 *               description: ID del tipo de transacción
 *             propertyConditionId:
 *               type: integer
 *               description: ID de la condición de la propiedad
 *             address:
 *               type: string
 *               description: Dirección
 *             city:
 *               type: string
 *               description: Ciudad
 *             state:
 *               type: string
 *               description: Estado/Departamento
 *             bedrooms:
 *               type: integer
 *               description: Número de habitaciones
 *             bathrooms:
 *               type: integer
 *               description: Número de baños
 *         images:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: URL de la imagen
 *               alt:
 *                 type: string
 *                 description: Texto alternativo
 *               isPrimary:
 *                 type: boolean
 *                 description: Si es la imagen principal
 *         features:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               featureId:
 *                 type: integer
 *                 description: ID de la característica
 *               value:
 *                 type: string
 *                 description: Valor de la característica
 * 
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Indica si la operación fue exitosa
 *         message:
 *           type: string
 *           description: Mensaje descriptivo
 *         data:
 *           description: Datos de respuesta
 *         error:
 *           type: string
 *           description: Mensaje de error (solo si success es false)
 *     
 *     PaginatedResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ApiResponse'
 *         - type: object
 *           properties:
 *             pagination:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   description: Página actual
 *                 limit:
 *                   type: integer
 *                   description: Elementos por página
 *                 total:
 *                   type: integer
 *                   description: Total de elementos
 *                 totalPages:
 *                   type: integer
 *                   description: Total de páginas
 */

import { Router } from 'express';
import { PropertyController } from '../controllers/PropertyController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { apiRateLimit } from '../middlewares/RateLimitMiddleware';

const router = Router();
const propertyController = new PropertyController();


const authMiddleware = new AuthMiddleware();

// Aplicar autenticación a todas las rutas de usuarios
router.use(authMiddleware.authenticate);

// Aplicar rate limiting
router.use(apiRateLimit);
/**
 * @swagger
 * /api/v1/properties:
 *   get:
 *     tags: [Properties]
 *     summary: Obtener lista de propiedades con filtros y paginación
 *     description: Permite buscar y filtrar propiedades con múltiples criterios y paginación
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Elementos por página (máximo 100)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           default: createdAt
 *           enum: [createdAt, price, title, totalArea]
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           default: DESC
 *           enum: [ASC, DESC]
 *         description: Orden ascendente o descendente
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Búsqueda en título y descripción
 *       - in: query
 *         name: propertyTypeId
 *         schema:
 *           type: integer
 *         description: Filtrar por tipo de propiedad
 *       - in: query
 *         name: propertyStatusId
 *         schema:
 *           type: integer
 *         description: Filtrar por estado de la propiedad
 *       - in: query
 *         name: transactionTypeId
 *         schema:
 *           type: integer
 *         description: Filtrar por tipo de transacción
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filtrar por ciudad
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *         description: Filtrar por estado/departamento
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Precio mínimo
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Precio máximo
 *       - in: query
 *         name: minArea
 *         schema:
 *           type: number
 *         description: Área mínima en m²
 *       - in: query
 *         name: maxArea
 *         schema:
 *           type: number
 *         description: Área máxima en m²
 *       - in: query
 *         name: bedrooms
 *         schema:
 *           type: integer
 *         description: Número de habitaciones
 *       - in: query
 *         name: bathrooms
 *         schema:
 *           type: integer
 *         description: Número de baños
 *       - in: query
 *         name: isPublished
 *         schema:
 *           type: boolean
 *         description: Solo propiedades publicadas
 *       - in: query
 *         name: isFeatured
 *         schema:
 *           type: boolean
 *         description: Solo propiedades destacadas
 *     responses:
 *       200:
 *         description: Lista de propiedades obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *             example:
 *               success: true
 *               data: []
 *               pagination:
 *                 page: 1
 *                 limit: 10
 *                 total: 50
 *                 totalPages: 5
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */
router.get('/', propertyController.getProperties);

/**
 * @swagger
 * /api/v1/properties/featured:
 *   get:
 *     tags: [Properties]
 *     summary: Obtener propiedades destacadas
 *     description: Retorna las propiedades marcadas como destacadas y publicadas
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *           maximum: 20
 *         description: Número máximo de propiedades a retornar
 *     responses:
 *       200:
 *         description: Propiedades destacadas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data: []
 *       500:
 *         description: Error interno del servidor
 */
router.get('/featured', propertyController.getFeaturedProperties);

/**
 * @swagger
 * /api/v1/properties/slug/{slug}:
 *   get:
 *     tags: [Properties]
 *     summary: Obtener propiedad por slug
 *     description: Busca una propiedad específica usando su slug único
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Slug único de la propiedad
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir propiedades inactivas
 *     responses:
 *       200:
 *         description: Propiedad encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Propiedad no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Propiedad no encontrada"
 *       500:
 *         description: Error interno del servidor
 */
router.get('/slug/:slug', propertyController.getPropertyBySlug);

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   get:
 *     tags: [Properties]
 *     summary: Obtener propiedad por ID
 *     description: Busca una propiedad específica por su ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID único de la propiedad
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir propiedades inactivas
 *     responses:
 *       200:
 *         description: Propiedad encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Propiedad no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', propertyController.getProperty);

/**
 * @swagger
 * /api/v1/properties/{id}/similar:
 *   get:
 *     tags: [Properties]
 *     summary: Obtener propiedades similares
 *     description: Busca propiedades similares basadas en tipo y ubicación
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la propiedad de referencia
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 4
 *           maximum: 10
 *         description: Número máximo de propiedades similares
 *     responses:
 *       200:
 *         description: Propiedades similares encontradas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Propiedad de referencia no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/similar', propertyController.getSimilarProperties);

/**
 * @swagger
 * /api/v1/properties/user/{userId}:
 *   get:
 *     tags: [Properties]
 *     summary: Obtener propiedades de un usuario
 *     description: Retorna todas las propiedades que pertenecen a un usuario específico
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del usuario propietario
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir propiedades inactivas
 *     responses:
 *       200:
 *         description: Propiedades del usuario obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedResponse'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/user/:userId', propertyController.getUserProperties);

/**
 * @swagger
 * /api/v1/properties:
 *   post:
 *     tags: [Properties]
 *     summary: Crear nueva propiedad
 *     description: Crea una nueva propiedad con imágenes y características
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyRequest'
 *           example:
 *             property:
 *               title: "Casa de 3 habitaciones en Zona Norte"
 *               description: "Hermosa casa familiar con jardín"
 *               price: 450000000
 *               propertyTypeId: 1
 *               propertyStatusId: 1
 *               transactionTypeId: 1
 *               propertyConditionId: 1
 *               address: "Calle 123 #45-67"
 *               city: "Bogotá"
 *               state: "Cundinamarca"
 *               bedrooms: 3
 *               bathrooms: 2
 *             images:
 *               - url: "https://example.com/image1.jpg"
 *                 alt: "Fachada principal"
 *                 isPrimary: true
 *             features:
 *               - featureId: 1
 *                 value: "true"
 *     responses:
 *       201:
 *         description: Propiedad creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Propiedad creada exitosamente"
 *               data: {}
 *       400:
 *         description: Datos de entrada inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: false
 *               message: "Título y precio son requeridos"
 */
router.post('/', propertyController.createProperty);

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   put:
 *     tags: [Properties]
 *     summary: Actualizar propiedad
 *     description: Actualiza una propiedad existente con nuevos datos
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la propiedad a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePropertyRequest'
 *     responses:
 *       200:
 *         description: Propiedad actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Datos de entrada inválidos
 *       404:
 *         description: Propiedad no encontrada
 */
router.put('/:id', propertyController.updateProperty);

/**
 * @swagger
 * /api/v1/properties/{id}:
 *   delete:
 *     tags: [Properties]
 *     summary: Eliminar propiedad
 *     description: Elimina una propiedad (soft delete - marca como inactiva)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la propiedad a eliminar
 *     responses:
 *       200:
 *         description: Propiedad eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Error al eliminar la propiedad
 */
router.delete('/:id', propertyController.deleteProperty);

/**
 * @swagger
 * /api/v1/properties/{id}/publish:
 *   patch:
 *     tags: [Properties]
 *     summary: Publicar propiedad
 *     description: Marca una propiedad como publicada y la hace visible públicamente
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la propiedad a publicar
 *     responses:
 *       200:
 *         description: Propiedad publicada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Propiedad publicada exitosamente"
 *               data: {}
 *       400:
 *         description: Error al publicar la propiedad
 */
router.patch('/:id/publish', propertyController.publishProperty);

/**
 * @swagger
 * /api/v1/properties/{id}/unpublish:
 *   patch:
 *     tags: [Properties]
 *     summary: Despublicar propiedad
 *     description: Marca una propiedad como no publicada y la oculta del público
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la propiedad a despublicar
 *     responses:
 *       200:
 *         description: Propiedad despublicada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               message: "Propiedad despublicada exitosamente"
 *               data: {}
 *       400:
 *         description: Error al despublicar la propiedad
 */
router.patch('/:id/unpublish', propertyController.unpublishProperty);

export default router;