import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Property } from './Property';

@Entity('property_images')
export class PropertyImage {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  propertyId?: number;

  @Column({ length: 500 })
  url?: string;

  @Column({ length: 255, nullable: true })
  alt?: string;

  @Column({ length: 255, nullable: true })
  title?: string;

  @Column({ type: 'int', default: 0 })
  order?: number;

  @Column({ default: false })
  isPrimary?: boolean; // Imagen principal

  @Column({ default: true })
  isActive?: boolean;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @ManyToOne(() => Property, property => property.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propertyId' })
  property?: Property;
}