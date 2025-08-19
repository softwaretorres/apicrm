import { Repository, SelectQueryBuilder } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Property } from '../entities/Property';
import { PropertyImage } from '../entities/PropertyImage';
import { PropertyFeatureValue } from '../entities/PropertyFeatureValue';
import { generateUniqueSlug, updateSlugIfNeeded } from '../utils/slugGenerator';

export interface PropertyFilters {
  userId?: number;
  propertyTypeId?: number;
  propertyStatusId?: number;
  transactionTypeId?: number;
  propertyConditionId?: number;
  city?: string;
  state?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  features?: Record<string, any>;
  isPublished?: boolean;
  isFeatured?: boolean;
  search?: string;
}

export interface PropertyCreateData {
  property: Partial<Property>;
  images?: Array<{
    url: string;
    alt?: string;
    title?: string;
    order?: number;
    isPrimary?: boolean;
  }>;
  features?: Record<number, any>; // featureId: value
}

export class PropertyService {
  private propertyRepo: Repository<Property>;
  private imageRepo: Repository<PropertyImage>;
  private featureValueRepo: Repository<PropertyFeatureValue>;

  constructor() {
    this.propertyRepo = AppDataSource.getRepository(Property);
    this.imageRepo = AppDataSource.getRepository(PropertyImage);
    this.featureValueRepo = AppDataSource.getRepository(PropertyFeatureValue);
  }

  async getAllProperties(
    filters: PropertyFilters = {},
    page = 1,
    limit = 10,
    sort = 'createdAt',
    order: 'ASC' | 'DESC' = 'DESC'
  ) {
    let query = this.propertyRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.propertyType', 'pt')
      .leftJoinAndSelect('p.propertyStatus', 'ps')
      .leftJoinAndSelect('p.transactionType', 'tt')
      .leftJoinAndSelect('p.propertyCondition', 'pc')
      .leftJoinAndSelect('p.images', 'img', 'img.isActive = true')
      .leftJoinAndSelect('p.featureValues', 'fv')
      .leftJoinAndSelect('fv.feature', 'f');

    query = this.applyFilters(query, filters);

    // Búsqueda de texto
    if (filters.search) {
      query = query.andWhere(
        '(p.title LIKE :search OR p.description LIKE :search OR p.address LIKE :search OR p.city LIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Paginación
    const skip = (page - 1) * limit;
    query = query.skip(skip).take(limit);

    // Ordenamiento
    query = query.orderBy(`p.${sort}`, order);

    const [properties, total] = await query.getManyAndCount();

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    };
  }

  async getPropertyById(id: number, includeInactive = false) {
    let query = this.propertyRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.propertyType', 'pt')
      .leftJoinAndSelect('p.propertyStatus', 'ps')
      .leftJoinAndSelect('p.transactionType', 'tt')
      .leftJoinAndSelect('p.propertyCondition', 'pc')
      .leftJoinAndSelect('p.images', 'img')
      .leftJoinAndSelect('p.featureValues', 'fv')
      .leftJoinAndSelect('fv.feature', 'f')
      .where('p.id = :id', { id });

    if (!includeInactive) {
      query = query.andWhere('p.isActive = true');
    }

    return await query.getOne();
  }

  async getPropertyBySlug(slug: string, includeInactive = false) {
    let query = this.propertyRepo
      .createQueryBuilder('p')
      .leftJoinAndSelect('p.propertyType', 'pt')
      .leftJoinAndSelect('p.propertyStatus', 'ps')
      .leftJoinAndSelect('p.transactionType', 'tt')
      .leftJoinAndSelect('p.propertyCondition', 'pc')
      .leftJoinAndSelect('p.images', 'img', 'img.isActive = true')
      .leftJoinAndSelect('p.featureValues', 'fv')
      .leftJoinAndSelect('fv.feature', 'f')
      .where('p.slug = :slug', { slug });

    if (!includeInactive) {
      query = query.andWhere('p.isActive = true');
    }

    return await query.getOne();
  }

  async createProperty(data: PropertyCreateData) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Crear la propiedad
      const property = this.propertyRepo.create(data.property);
      
      // Generar slug si no se proporciona
      if (!property.slug && property.title) {
        property.slug = await generateUniqueSlug(
          property.title,
          async (slug) => {
            const existing = await this.propertyRepo.findOne({ where: { slug } });
            return !!existing;
          }
        );
      }

      const savedProperty = await queryRunner.manager.save(property);

      // Agregar imágenes si existen
      if (data.images && data.images.length > 0) {
        const images = data.images.map(imgData => {
          const image = this.imageRepo.create({
            ...imgData,
            propertyId: savedProperty.id
          });
          return image;
        });
        await queryRunner.manager.save(images);
      }

      // Agregar características si existen
      if (data.features) {
        const featureValues = Object.entries(data.features).map(([featureId, value]) => {
          return this.featureValueRepo.create({
            propertyId: savedProperty.id,
            featureId: parseInt(featureId),
            value: typeof value === 'string' ? value : JSON.stringify(value)
          });
        });
        await queryRunner.manager.save(featureValues);
      }

      await queryRunner.commitTransaction();
      
      // Retornar la propiedad completa
      if (savedProperty.id === undefined) {
        throw new Error('La propiedad guardada no tiene un ID');
      }
      return await this.getPropertyById(savedProperty.id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProperty(id: number, data: PropertyCreateData) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar que la propiedad existe
      const existingProperty = await this.getPropertyById(id, true);
      if (!existingProperty) {
        throw new Error('Propiedad no encontrada');
      }

      // Actualizar datos básicos
      if (data.property) {
        // Generar nuevo slug si el título cambió
        if (data.property.title && data.property.title !== existingProperty.title) {
          data.property.slug = await updateSlugIfNeeded(
            data.property.title,
            existingProperty.slug ?? '',
            existingProperty.title ?? '',
            async (slug) => {
              const existing = await this.propertyRepo.findOne({ 
                where: { slug } 
              });
              return !!existing && existing.id !== id;
            }
          );
        }

        await queryRunner.manager.update(Property, id, data.property);
      }

      // Actualizar imágenes si se proporcionan
      if (data.images) {
        // Eliminar imágenes existentes
        await queryRunner.manager.delete(PropertyImage, { propertyId: id });
        
        // Agregar nuevas imágenes
        const images = data.images.map(imgData => {
          return this.imageRepo.create({
            ...imgData,
            propertyId: id
          });
        });
        await queryRunner.manager.save(images);
      }

      // Actualizar características si se proporcionan
      if (data.features) {
        // Eliminar características existentes
        await queryRunner.manager.delete(PropertyFeatureValue, { propertyId: id });
        
        // Agregar nuevas características
        const featureValues = Object.entries(data.features).map(([featureId, value]) => {
          return this.featureValueRepo.create({
            propertyId: id,
            featureId: parseInt(featureId),
            value: typeof value === 'string' ? value : JSON.stringify(value)
          });
        });
        await queryRunner.manager.save(featureValues);
      }

      await queryRunner.commitTransaction();
      
      return await this.getPropertyById(id);

    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteProperty(id: number) {
    const property = await this.getPropertyById(id, true);
    if (!property) {
      throw new Error('Propiedad no encontrada');
    }

    // Soft delete - solo marcar como inactiva
    await this.propertyRepo.update(id, { isActive: false });
    return { message: 'Propiedad eliminada correctamente' };
  }

  async publishProperty(id: number) {
    const property = await this.getPropertyById(id, true);
    if (!property) {
      throw new Error('Propiedad no encontrada');
    }

    await this.propertyRepo.update(id, { 
      isPublished: true, 
      publishedAt: new Date() 
    });
    
    return await this.getPropertyById(id);
  }

  async unpublishProperty(id: number) {
    await this.propertyRepo.update(id, { 
      isPublished: false, 
      publishedAt: null 
    });
    
    return await this.getPropertyById(id);
  }

  async getUserProperties(userId: number, includeInactive = false) {
    const filters: PropertyFilters = { userId };
    if (!includeInactive) {
      filters.isPublished = true;
    }

    return await this.getAllProperties(filters);
  }

  private applyFilters(query: SelectQueryBuilder<Property>, filters: PropertyFilters) {
    if (filters.userId) {
      query = query.andWhere('p.userId = :userId', { userId: filters.userId });
    }

    if (filters.propertyTypeId) {
      query = query.andWhere('p.propertyTypeId = :propertyTypeId', { 
        propertyTypeId: filters.propertyTypeId 
      });
    }

    if (filters.propertyStatusId) {
      query = query.andWhere('p.propertyStatusId = :propertyStatusId', { 
        propertyStatusId: filters.propertyStatusId 
      });
    }

    if (filters.transactionTypeId) {
      query = query.andWhere('p.transactionTypeId = :transactionTypeId', { 
        transactionTypeId: filters.transactionTypeId 
      });
    }

    if (filters.propertyConditionId) {
      query = query.andWhere('p.propertyConditionId = :propertyConditionId', { 
        propertyConditionId: filters.propertyConditionId 
      });
    }

    if (filters.city) {
      query = query.andWhere('p.city = :city', { city: filters.city });
    }

    if (filters.state) {
      query = query.andWhere('p.state = :state', { state: filters.state });
    }

    if (filters.country) {
      query = query.andWhere('p.country = :country', { country: filters.country });
    }

    if (filters.minPrice) {
      query = query.andWhere('p.price >= :minPrice', { minPrice: filters.minPrice });
    }

    if (filters.maxPrice) {
      query = query.andWhere('p.price <= :maxPrice', { maxPrice: filters.maxPrice });
    }

    if (filters.minArea) {
      query = query.andWhere('p.totalArea >= :minArea', { minArea: filters.minArea });
    }

    if (filters.maxArea) {
      query = query.andWhere('p.totalArea <= :maxArea', { maxArea: filters.maxArea });
    }

    if (filters.bedrooms) {
      query = query.andWhere('p.bedrooms = :bedrooms', { bedrooms: filters.bedrooms });
    }

    if (filters.bathrooms) {
      query = query.andWhere('p.bathrooms = :bathrooms', { bathrooms: filters.bathrooms });
    }

    if (filters.parkingSpaces) {
      query = query.andWhere('p.parkingSpaces >= :parkingSpaces', { 
        parkingSpaces: filters.parkingSpaces 
      });
    }

    if (filters.isPublished !== undefined) {
      query = query.andWhere('p.isPublished = :isPublished', { 
        isPublished: filters.isPublished 
      });
    }

    if (filters.isFeatured !== undefined) {
      query = query.andWhere('p.isFeatured = :isFeatured', { 
        isFeatured: filters.isFeatured 
      });
    }

    return query;
  }

  private async generateSlug(title: string): Promise<string> {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim();

    let slug = baseSlug;
    let counter = 1;

    // Verificar si el slug ya existe
    while (await this.propertyRepo.findOne({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}