import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { PropertyFeatureValue } from './PropertyFeatureValue';

export enum FeatureType {
  BOOLEAN = 'boolean',
  TEXT = 'text',
  NUMBER = 'number',
  MULTIPLE_CHOICE = 'multiple_choice'
}

export enum FeatureCategory {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
  GENERAL = 'general'
}

@Entity('property_features')
export class PropertyFeature {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ length: 100 })
  name?: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({
    type: 'enum',
    enum: FeatureType,
    default: FeatureType.BOOLEAN
  })
  type?: FeatureType;

  @Column({
    type: 'enum',
    enum: FeatureCategory,
    default: FeatureCategory.GENERAL
  })
  category?: FeatureCategory;

  @Column({ type: 'json', nullable: true })
  options?: string[]; // Para multiple_choice

  @Column({ length: 20, nullable: true })
  unit?: string; // Para números (m², años, etc.)

  @Column({ name: 'display_order', type: 'int', default: 0 }) // ✅ CAMBIADO: order → display_order
  displayOrder?: number; // ✅ CAMBIADO: order → displayOrder


  @Column({ default: true })
  isRequired?: boolean;

  @Column({ default: true })
  isActive?: boolean;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @OneToMany(() => PropertyFeatureValue, featureValue => featureValue.feature)
  featureValues?: PropertyFeatureValue[];
}