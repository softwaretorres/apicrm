import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { PropertyType } from '../entities/PropertyType';
import { PropertyStatus } from '../entities/PropertyStatus';
import { TransactionType } from '../entities/TransactionType';
import { PropertyCondition } from '../entities/PropertyCondition';
import { PropertyFeature } from '../entities/PropertyFeature';

export class CatalogService {
  private propertyTypeRepo: Repository<PropertyType>;
  private propertyStatusRepo: Repository<PropertyStatus>;
  private transactionTypeRepo: Repository<TransactionType>;
  private propertyConditionRepo: Repository<PropertyCondition>;
  private propertyFeatureRepo: Repository<PropertyFeature>;

  constructor() {
    this.propertyTypeRepo = AppDataSource.getRepository(PropertyType);
    this.propertyStatusRepo = AppDataSource.getRepository(PropertyStatus);
    this.transactionTypeRepo = AppDataSource.getRepository(TransactionType);
    this.propertyConditionRepo = AppDataSource.getRepository(PropertyCondition);
    this.propertyFeatureRepo = AppDataSource.getRepository(PropertyFeature);
  }

  // Property Types
  async getAllPropertyTypes(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    return await this.propertyTypeRepo.find({ where, order: { name: 'ASC' } });
  }

  async getPropertyTypeById(id: number) {
    return await this.propertyTypeRepo.findOne({ where: { id } });
  }

  async createPropertyType(data: Partial<PropertyType>) {
    const propertyType = this.propertyTypeRepo.create(data);
    return await this.propertyTypeRepo.save(propertyType);
  }

  async updatePropertyType(id: number, data: Partial<PropertyType>) {
    await this.propertyTypeRepo.update(id, data);
    return await this.getPropertyTypeById(id);
  }

  async deletePropertyType(id: number) {
    const propertiesCount = await this.propertyTypeRepo
      .createQueryBuilder('pt')
      .leftJoin('pt.properties', 'p')
      .where('pt.id = :id', { id })
      .andWhere('p.id IS NOT NULL')
      .getCount();

    if (propertiesCount > 0) {
      throw new Error('No se puede eliminar el tipo de propiedad porque tiene propiedades asociadas');
    }

    return await this.propertyTypeRepo.delete(id);
  }

  // Property Statuses
  async getAllPropertyStatuses(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    return await this.propertyStatusRepo.find({ where, order: { name: 'ASC' } });
  }

  async getPropertyStatusById(id: number) {
    return await this.propertyStatusRepo.findOne({ where: { id } });
  }

  async createPropertyStatus(data: Partial<PropertyStatus>) {
    const propertyStatus = this.propertyStatusRepo.create(data);
    return await this.propertyStatusRepo.save(propertyStatus);
  }

  async updatePropertyStatus(id: number, data: Partial<PropertyStatus>) {
    await this.propertyStatusRepo.update(id, data);
    return await this.getPropertyStatusById(id);
  }

  async deletePropertyStatus(id: number) {
    const propertiesCount = await this.propertyStatusRepo
      .createQueryBuilder('ps')
      .leftJoin('ps.properties', 'p')
      .where('ps.id = :id', { id })
      .andWhere('p.id IS NOT NULL')
      .getCount();

    if (propertiesCount > 0) {
      throw new Error('No se puede eliminar el estado porque tiene propiedades asociadas');
    }

    return await this.propertyStatusRepo.delete(id);
  }

  // Transaction Types
  async getAllTransactionTypes(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    return await this.transactionTypeRepo.find({ where, order: { name: 'ASC' } });
  }

  async getTransactionTypeById(id: number) {
    return await this.transactionTypeRepo.findOne({ where: { id } });
  }

  async createTransactionType(data: Partial<TransactionType>) {
    const transactionType = this.transactionTypeRepo.create(data);
    return await this.transactionTypeRepo.save(transactionType);
  }

  async updateTransactionType(id: number, data: Partial<TransactionType>) {
    await this.transactionTypeRepo.update(id, data);
    return await this.getTransactionTypeById(id);
  }

  async deleteTransactionType(id: number) {
    const propertiesCount = await this.transactionTypeRepo
      .createQueryBuilder('tt')
      .leftJoin('tt.properties', 'p')
      .where('tt.id = :id', { id })
      .andWhere('p.id IS NOT NULL')
      .getCount();

    if (propertiesCount > 0) {
      throw new Error('No se puede eliminar el tipo de transacción porque tiene propiedades asociadas');
    }

    return await this.transactionTypeRepo.delete(id);
  }

  // Property Conditions
  async getAllPropertyConditions(includeInactive = false) {
    const where = includeInactive ? {} : { isActive: true };
    return await this.propertyConditionRepo.find({ 
      where, 
      order: { displayOrder: 'ASC', name: 'ASC' } // ✅ CAMBIADO: order → displayOrder
    });
  }

  async getPropertyConditionById(id: number) {
    return await this.propertyConditionRepo.findOne({ where: { id } });
  }

  async createPropertyCondition(data: Partial<PropertyCondition>) {
    const propertyCondition = this.propertyConditionRepo.create(data);
    return await this.propertyConditionRepo.save(propertyCondition);
  }

  async updatePropertyCondition(id: number, data: Partial<PropertyCondition>) {
    await this.propertyConditionRepo.update(id, data);
    return await this.getPropertyConditionById(id);
  }

  async deletePropertyCondition(id: number) {
    const propertiesCount = await this.propertyConditionRepo
      .createQueryBuilder('pc')
      .leftJoin('pc.properties', 'p')
      .where('pc.id = :id', { id })
      .andWhere('p.id IS NOT NULL')
      .getCount();

    if (propertiesCount > 0) {
      throw new Error('No se puede eliminar la condición porque tiene propiedades asociadas');
    }

    return await this.propertyConditionRepo.delete(id);
  }

  // Property Features
  async getAllPropertyFeatures(includeInactive = false, category?: string) {
    let query = this.propertyFeatureRepo.createQueryBuilder('pf');
    
    if (!includeInactive) {
      query = query.where('pf.isActive = :isActive', { isActive: true });
    }
    
    if (category) {
      query = query.andWhere('pf.category = :category', { category });
    }
    
    return await query.orderBy('pf.order', 'ASC').addOrderBy('pf.name', 'ASC').getMany();
  }

  async getPropertyFeatureById(id: number) {
    return await this.propertyFeatureRepo.findOne({ where: { id } });
  }

  async createPropertyFeature(data: Partial<PropertyFeature>) {
    const propertyFeature = this.propertyFeatureRepo.create(data);
    return await this.propertyFeatureRepo.save(propertyFeature);
  }

  async updatePropertyFeature(id: number, data: Partial<PropertyFeature>) {
    await this.propertyFeatureRepo.update(id, data);
    return await this.getPropertyFeatureById(id);
  }

  async deletePropertyFeature(id: number) {
    const valuesCount = await this.propertyFeatureRepo
      .createQueryBuilder('pf')
      .leftJoin('pf.featureValues', 'pfv')
      .where('pf.id = :id', { id })
      .andWhere('pfv.id IS NOT NULL')
      .getCount();

    if (valuesCount > 0) {
      throw new Error('No se puede eliminar la característica porque tiene valores asociados');
    }

    return await this.propertyFeatureRepo.delete(id);
  }

  // Método para obtener todos los catálogos de una vez
  async getAllCatalogs() {
    const [
      propertyTypes,
      propertyStatuses,
      transactionTypes,
      propertyConditions,
      propertyFeatures
    ] = await Promise.all([
      this.getAllPropertyTypes(),
      this.getAllPropertyStatuses(),
      this.getAllTransactionTypes(),
      this.getAllPropertyConditions(),
      this.getAllPropertyFeatures()
    ]);

    return {
      propertyTypes,
      propertyStatuses,
      transactionTypes,
      propertyConditions,
      propertyFeatures
    };
  }
}
