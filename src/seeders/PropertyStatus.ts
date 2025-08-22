// src/entities/PropertyStatus.ts

import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany,
  Index
} from 'typeorm';
import { Property } from '../entities/Property';

@Entity('property_statuses')
@Index(['name'], { unique: true })
@Index(['isActive'])
export class PropertyStatus {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ length: 7, nullable: true })
  color?: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @OneToMany(() => Property, property => property.propertyStatus, {
    cascade: false,
    lazy: true
  })
  properties!: Promise<Property[]>;

  // Métodos auxiliares
  public async getPropertiesCount(): Promise<number> {
    const properties = await this.properties;
    return Array.isArray(properties) ? properties.length : 0;
  }

  public isAvailable(): boolean {
    return this.name === 'Disponible';
  }

  public isSold(): boolean {
    return this.name === 'Vendida';
  }

  public isRented(): boolean {
    return this.name === 'Alquilada';
  }

  public async toJSON() {
    const propertiesCount = await this.getPropertiesCount();

    return {
      id: this.id,
      name: this.name,
      description: this.description,
      color: this.color,
      isActive: this.isActive,
      propertiesCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}