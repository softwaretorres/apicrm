import { Request, Response } from 'express';
import { PropertyService, PropertyFilters } from '../services/PropertyService';

export class PropertyController {
  private propertyService: PropertyService;

  constructor() {
    this.propertyService = new PropertyService();
  }

  getProperties = async (req: Request, res: Response) => {
    try {
      // Extraer parámetros de query
      const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'DESC',
        search,
        propertyTypeId,
        propertyStatusId,
        transactionTypeId,
        propertyConditionId,
        city,
        state,
        country,
        minPrice,
        maxPrice,
        minArea,
        maxArea,
        bedrooms,
        bathrooms,
        parkingSpaces,
        isPublished,
        isFeatured,
        userId
      } = req.query;

      // Construir filtros
      const filters: PropertyFilters = {};
      
      if (propertyTypeId) filters.propertyTypeId = parseInt(propertyTypeId as string);
      if (propertyStatusId) filters.propertyStatusId = parseInt(propertyStatusId as string);
      if (transactionTypeId) filters.transactionTypeId = parseInt(transactionTypeId as string);
      if (propertyConditionId) filters.propertyConditionId = parseInt(propertyConditionId as string);
      if (city) filters.city = city as string;
      if (state) filters.state = state as string;
      if (country) filters.country = country as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (minArea) filters.minArea = parseFloat(minArea as string);
      if (maxArea) filters.maxArea = parseFloat(maxArea as string);
      if (bedrooms) filters.bedrooms = parseInt(bedrooms as string);
      if (bathrooms) filters.bathrooms = parseInt(bathrooms as string);
      if (parkingSpaces) filters.parkingSpaces = parseInt(parkingSpaces as string);
      if (isPublished !== undefined) filters.isPublished = isPublished === 'true';
      if (isFeatured !== undefined) filters.isFeatured = isFeatured === 'true';
      if (userId) filters.userId = parseInt(userId as string);
      if (search) filters.search = search as string;

      const result = await this.propertyService.getAllProperties(
        filters,
        parseInt(page as string),
        parseInt(limit as string),
        sort as string,
        order as 'ASC' | 'DESC'
      );

      res.json({
        success: true,
        data: result.properties,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener propiedades',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  getProperty = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const includeInactive = req.query.includeInactive === 'true';
      
      const property = await this.propertyService.getPropertyById(
        parseInt(id), 
        includeInactive
      );

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Propiedad no encontrada'
        });
      }

      res.json({
        success: true,
        data: property
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  getPropertyBySlug = async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const includeInactive = req.query.includeInactive === 'true';
      
      const property = await this.propertyService.getPropertyBySlug(
        slug, 
        includeInactive
      );

      if (!property) {
        return res.status(404).json({
          success: false,
          message: 'Propiedad no encontrada'
        });
      }

      res.json({
        success: true,
        data: property
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  createProperty = async (req: Request, res: Response) => {
    try {
      const { property, images, features } = req.body;
      
      // Validaciones básicas
      if (!property.title || !property.price) {
        return res.status(400).json({
          success: false,
          message: 'Título y precio son requeridos'
        });
      }

      const newProperty = await this.propertyService.createProperty({
        property,
        images,
        features
      });

      res.status(201).json({
        success: true,
        message: 'Propiedad creada exitosamente',
        data: newProperty
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al crear propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  updateProperty = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { property, images, features } = req.body;

      const updatedProperty = await this.propertyService.updateProperty(
        parseInt(id),
        { property, images, features }
      );

      if (!updatedProperty) {
        return res.status(404).json({
          success: false,
          message: 'Propiedad no encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Propiedad actualizada exitosamente',
        data: updatedProperty
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al actualizar propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  deleteProperty = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const result = await this.propertyService.deleteProperty(parseInt(id));

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al eliminar propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  publishProperty = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const property = await this.propertyService.publishProperty(parseInt(id));

      res.json({
        success: true,
        message: 'Propiedad publicada exitosamente',
        data: property
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al publicar propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  unpublishProperty = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const property = await this.propertyService.unpublishProperty(parseInt(id));

      res.json({
        success: true,
        message: 'Propiedad despublicada exitosamente',
        data: property
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al despublicar propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  getUserProperties = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const includeInactive = req.query.includeInactive === 'true';
      
      const result = await this.propertyService.getUserProperties(
        parseInt(userId),
        includeInactive
      );

      res.json({
        success: true,
        data: result.properties,
        pagination: result.pagination
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener propiedades del usuario',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // Método para obtener propiedades destacadas
  getFeaturedProperties = async (req: Request, res: Response) => {
    try {
      const { limit = 6 } = req.query;
      
      const filters: PropertyFilters = {
        isFeatured: true,
        isPublished: true
      };

      const result = await this.propertyService.getAllProperties(
        filters,
        1,
        parseInt(limit as string),
        'createdAt',
        'DESC'
      );

      res.json({
        success: true,
        data: result.properties
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener propiedades destacadas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // Método para obtener propiedades similares
  getSimilarProperties = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { limit = 4 } = req.query;

      // Primero obtener la propiedad actual
      const currentProperty = await this.propertyService.getPropertyById(parseInt(id));
      
      if (!currentProperty) {
        return res.status(404).json({
          success: false,
          message: 'Propiedad no encontrada'
        });
      }

      // Buscar propiedades similares
      const filters: PropertyFilters = {
        propertyTypeId: currentProperty.propertyTypeId,
        isPublished: true,
        city: currentProperty.city
      };

      const result = await this.propertyService.getAllProperties(
        filters,
        1,
        parseInt(limit as string) + 1, // +1 para excluir la propiedad actual
        'createdAt',
        'DESC'
      );

      // Excluir la propiedad actual de los resultados
      const similarProperties = result.properties.filter((p:any) => p.id !== parseInt(id));

      res.json({
        success: true,
        data: similarProperties.slice(0, parseInt(limit as string))
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener propiedades similares',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };
}