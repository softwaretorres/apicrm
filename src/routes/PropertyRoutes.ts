import { Router } from 'express';
import { PropertyController } from '../controllers/PropertyController';

const router = Router();
const propertyController = new PropertyController();

// Rutas públicas
router.get('/', propertyController.getProperties);
router.get('/featured', propertyController.getFeaturedProperties);
router.get('/slug/:slug', propertyController.getPropertyBySlug);
router.get('/:id', propertyController.getProperty);
router.get('/:id/similar', propertyController.getSimilarProperties);

// Rutas para obtener propiedades de un usuario específico
router.get('/user/:userId', propertyController.getUserProperties);

// Rutas protegidas (por ahora sin autenticación)
router.post('/', propertyController.createProperty);
router.put('/:id', propertyController.updateProperty);
router.delete('/:id', propertyController.deleteProperty);
router.patch('/:id/publish', propertyController.publishProperty);
router.patch('/:id/unpublish', propertyController.unpublishProperty);

export default router;