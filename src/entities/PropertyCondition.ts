import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Property } from './Property';

@Entity('property_conditions')
export class PropertyCondition {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ length: 100, unique: true })
  name?: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ name: 'display_order', type: 'int', default: 0 }) // ✅ CAMBIADO: order → display_order
  displayOrder?: number; // ✅ CAMBIADO: order → displayOrder


  @Column({ default: true })
  isActive?: boolean;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @OneToMany(() => Property, property => property.propertyCondition)
  properties?: Property[];
}