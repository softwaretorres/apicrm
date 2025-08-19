import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Property } from './Property';

@Entity('property_types')
export class PropertyType {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ length: 100, unique: false })
  name?: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ default: true })
  isActive?: boolean;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @OneToMany(() => Property, property => property.propertyType)
  properties?: Property[];
}