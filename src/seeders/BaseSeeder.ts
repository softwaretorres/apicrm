// src/seeders/BaseSeeder.ts

import { AppDataSource } from '../config/database';
import { EntityTarget, Repository, ObjectLiteral } from 'typeorm';

export abstract class BaseSeeder {
  
  /**
   * Helper para obtener un repositorio tipado
   */
  protected getRepository<T extends ObjectLiteral>(entity: EntityTarget<T>): Repository<T> {
    return AppDataSource.getRepository(entity) as Repository<T>;
  }

  /**
   * Método abstracto que debe implementar cada seeder
   */
  abstract run(): Promise<void>;

  /**
   * Método para inicializar la conexión a la base de datos si no está inicializada
   */
  protected async ensureConnection(): Promise<void> {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
  }

  /**
   * Método helper para logging
   */
  protected log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
    const timestamp = new Date().toISOString();
    const icons = {
      info: 'ℹ️',
      success: '✅',
      warning: '⚠️',
      error: '❌'
    };
    
    console.log(`${icons[type]} [${timestamp}] ${message}`);
  }

  /**
   * Método para verificar si ya existen datos
   */
  protected async hasData<T extends ObjectLiteral>(
    entity: EntityTarget<T>, 
    condition: any = {}
  ): Promise<boolean> {
    const repository = this.getRepository(entity);
    const count = await repository.count({ where: condition });
    return count > 0;
  }

  /**
   * Método para crear datos si no existen
   */
protected async createIfNotExists<T extends ObjectLiteral>(
  entity: EntityTarget<T>, 
  data: Partial<T>[], 
  uniqueField: keyof T = 'name' as keyof T
): Promise<T[]> {
  const repository = this.getRepository(entity);
  const created: T[] = [];
  const entityName = this.getEntityName(entity);

  for (const item of data) {
    try {
      const existing = await repository.findOne({ 
        where: { [uniqueField as string]: item[uniqueField] } as any
      });

      if (!existing) {
        const saved = await this.createEntity(entity, item);
        created.push(saved);
        
        this.log(`Created ${entityName}: ${String(item[uniqueField])}`, 'success');
      } else {
        this.log(`${entityName} already exists: ${String(item[uniqueField])}`, 'info');
      }
    } catch (error) {
      this.log(`Error creating ${entityName} with ${String(uniqueField)}: ${String(item[uniqueField])} - ${error}`, 'error');
      throw error;
    }
  }

  return created;
}

  /**
   * Helper para obtener el nombre de la entidad
   */
  private getEntityName<T extends ObjectLiteral>(entity: EntityTarget<T>): string {
    if (typeof entity === 'string') {
      return entity;
    }
    if (typeof entity === 'function') {
      return entity.name;
    }
    return 'Entity';
  }

  /**
   * Método para ejecutar el seeder con manejo de errores
   */
  async execute(): Promise<void> {
    try {
      await this.ensureConnection();
      this.log(`Starting ${this.constructor.name}...`, 'info');
      await this.run();
      this.log(`${this.constructor.name} completed successfully!`, 'success');
    } catch (error) {
      this.log(`Error in ${this.constructor.name}: ${error}`, 'error');
      throw error;
    }
  }

  /**
   * Método helper para actualizar contadores
   */
  protected async updateCounter<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    id: string | number,
    field: keyof T,
    increment: number = 1
  ): Promise<void> {
    const repository = this.getRepository(entity);
    await repository.increment({ id } as any, field as string, increment);
  }

  /**
   * Método helper para obtener una entidad por campo único
   */
  protected async findByField<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    field: keyof T,
    value: any
  ): Promise<T | null> {
    const repository = this.getRepository(entity);
    return await repository.findOne({
      where: { [field as string]: value } as any
    });
  }

  /**
   * Método helper para buscar múltiples entidades
   */
  protected async findEntities<T extends ObjectLiteral>(
    entity: EntityTarget<T>,
    conditions?: any
  ): Promise<T[]> {
    const repository = this.getRepository(entity);
    return await repository.find(conditions ? { where: conditions } : {});
  }

  /**
   * Método helper para crear una sola entidad
   */
 protected async createEntity<T extends ObjectLiteral>(
  entity: EntityTarget<T>,
  data: Partial<T>
): Promise<T> {
  const repository = this.getRepository(entity);
  
  try {
    const newEntity = repository.create(data as any);
    const saved = await repository.save(newEntity);
    
    // Asegurarse de que retornamos una sola entidad
    if (Array.isArray(saved)) {
      return saved[0] as T;
    }
    
    return saved as T;
  } catch (error) {
    const entityName = this.getEntityName(entity);
    this.log(`Error creating ${entityName}: ${error}`, 'error');
    throw error;
  }
}
}