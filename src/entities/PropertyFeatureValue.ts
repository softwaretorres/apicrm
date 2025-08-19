import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Property } from './Property';
import { PropertyFeature } from './PropertyFeature';

@Entity('property_feature_values')
export class PropertyFeatureValue {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  propertyId?: number;

  @Column()
  featureId?: number;

  @Column({ type: 'text', nullable: true })
  value?: string; // Almacena el valor como string, se convierte según el tipo

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @ManyToOne(() => Property, property => property.featureValues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property?: Property;

  @ManyToOne(() => PropertyFeature, feature => feature.featureValues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'featureId' })
  feature?: PropertyFeature;
}
