import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Property } from './Property';

@Entity('property_statuses')
export class PropertyStatus {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ length: 100, unique: true })
  name?: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ length: 7, nullable: true })
  color?: string; // Para UI (hex color)

  @Column({ default: true })
  isActive?: boolean;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @OneToMany(() => Property, property => property.propertyStatus)
  properties?: Property[];
}