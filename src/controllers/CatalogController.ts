import { Request, Response } from 'express';
import { CatalogService } from '../services/CatalogService';

export class CatalogController {
  private catalogService: CatalogService;

  constructor() {
    this.catalogService = new CatalogService();
  }

  // Property Types
  getPropertyTypes = async (req: Request, res: Response) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const propertyTypes = await this.catalogService.getAllPropertyTypes(includeInactive);
      
      res.json({
        success: true,
        data: propertyTypes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener tipos de propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  getPropertyType = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const propertyType = await this.catalogService.getPropertyTypeById(parseInt(id));
      
      if (!propertyType) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de propiedad no encontrado'
        });
      }

      res.json({
        success: true,
        data: propertyType
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener tipo de propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  createPropertyType = async (req: Request, res: Response) => {
    try {
      const propertyType = await this.catalogService.createPropertyType(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Tipo de propiedad creado exitosamente',
        data: propertyType
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al crear tipo de propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  updatePropertyType = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const propertyType = await this.catalogService.updatePropertyType(parseInt(id), req.body);
      
      if (!propertyType) {
        return res.status(404).json({
          success: false,
          message: 'Tipo de propiedad no encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Tipo de propiedad actualizado exitosamente',
        data: propertyType
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al actualizar tipo de propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  deletePropertyType = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.catalogService.deletePropertyType(parseInt(id));
      
      res.json({
        success: true,
        message: 'Tipo de propiedad eliminado exitosamente'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al eliminar tipo de propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // Property Statuses
  getPropertyStatuses = async (req: Request, res: Response) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const propertyStatuses = await this.catalogService.getAllPropertyStatuses(includeInactive);
      
      res.json({
        success: true,
        data: propertyStatuses
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener estados de propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  createPropertyStatus = async (req: Request, res: Response) => {
    try {
      const propertyStatus = await this.catalogService.createPropertyStatus(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Estado de propiedad creado exitosamente',
        data: propertyStatus
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al crear estado de propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // Transaction Types  
  getTransactionTypes = async (req: Request, res: Response) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const transactionTypes = await this.catalogService.getAllTransactionTypes(includeInactive);
      
      res.json({
        success: true,
        data: transactionTypes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener tipos de transacción',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  createTransactionType = async (req: Request, res: Response) => {
    try {
      const transactionType = await this.catalogService.createTransactionType(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Tipo de transacción creado exitosamente',
        data: transactionType
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al crear tipo de transacción',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // Property Conditions
  getPropertyConditions = async (req: Request, res: Response) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const propertyConditions = await this.catalogService.getAllPropertyConditions(includeInactive);
      
      res.json({
        success: true,
        data: propertyConditions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener condiciones de propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  createPropertyCondition = async (req: Request, res: Response) => {
    try {
      const propertyCondition = await this.catalogService.createPropertyCondition(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Condición de propiedad creada exitosamente',
        data: propertyCondition
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al crear condición de propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // Property Features
  getPropertyFeatures = async (req: Request, res: Response) => {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const category = req.query.category as string;
      const propertyFeatures = await this.catalogService.getAllPropertyFeatures(includeInactive, category);
      
      res.json({
        success: true,
        data: propertyFeatures
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener características de propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  createPropertyFeature = async (req: Request, res: Response) => {
    try {
      const propertyFeature = await this.catalogService.createPropertyFeature(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Característica de propiedad creada exitosamente',
        data: propertyFeature
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: 'Error al crear característica de propiedad',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  // Get all catalogs
  getAllCatalogs = async (req: Request, res: Response) => {
    try {
      const catalogs = await this.catalogService.getAllCatalogs();
      
      res.json({
        success: true,
        data: catalogs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error al obtener catálogos',
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };
}