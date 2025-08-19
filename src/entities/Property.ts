import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PropertyType } from './PropertyType';
import { PropertyStatus } from './PropertyStatus';
import { TransactionType } from './TransactionType';
import { PropertyCondition } from './PropertyCondition';
import { PropertyFeatureValue } from './PropertyFeatureValue';
import { PropertyImage } from './PropertyImage';
import { User } from './User';
// import { User } from './User'; // Descomentar cuando tengas la entidad User

@Entity('properties')
export class Property {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ length: 255 })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column()
  userId?: number; // Owner de la propiedad

  @Column()
  propertyTypeId?: number;

  @Column()
  propertyStatusId?: number;

  @Column()
  transactionTypeId?: number;

  @Column()
  propertyConditionId?: number;

  // Información de ubicación
  @Column({ length: 255, nullable: true })
  address?: string;

  @Column({ length: 100, nullable: true })
  city?: string;

  @Column({ length: 100, nullable: true })
  state?: string;

  @Column({ length: 20, nullable: true })
  zipCode?: string;

  @Column({ length: 100, nullable: true })
  country?: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number;

  // Información de precio
  @Column({ type: 'decimal', precision: 15, scale: 2 })
  price?: number;

  @Column({ length: 3, default: 'USD' })
  currency?: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  pricePerSqft?: number;

  // Información de la propiedad
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  totalArea?: number; // m²

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  builtArea?: number; // m²

  @Column({ type: 'int', nullable: true })
  bedrooms?: number;

  @Column({ type: 'int', nullable: true })
  bathrooms?: number;

  @Column({ type: 'int', nullable: true })
  parkingSpaces?: number;

  @Column({ type: 'int', nullable: true })
  floors?: number;

  @Column({ type: 'int', nullable: true })
  yearBuilt?: number;

  // Información de contacto
  @Column({ length: 255, nullable: true })
  contactName?: string;

  @Column({ length: 50, nullable: true })
  contactPhone?: string;

  @Column({ length: 255, nullable: true })
  contactEmail?: string;

  // SEO y metadata
  @Column({ length: 255, nullable: true })
  slug?: string;

  @Column({ type: 'text', nullable: true })
  metaDescription?: string;

  @Column({ type: 'json', nullable: true })
  tags?: string[];

  // Estados
  @Column({ default: true })
  isActive?: boolean;

  @Column({ default: false })
  isFeatured?: boolean;

  @Column({ default: false })
  isPublished?: boolean;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  // Relaciones
   @ManyToOne(() => User, user => user.properties)
   @JoinColumn({ name: 'userId' })
   user?: User;

  @ManyToOne(() => PropertyType, propertyType => propertyType.properties)
  @JoinColumn({ name: 'propertyTypeId' })
  propertyType?: PropertyType;

  @ManyToOne(() => PropertyStatus, propertyStatus => propertyStatus.properties)
  @JoinColumn({ name: 'propertyStatusId' })
  propertyStatus?: PropertyStatus;

  @ManyToOne(() => TransactionType, transactionType => transactionType.properties)
  @JoinColumn({ name: 'transactionTypeId' })
  transactionType?: TransactionType;

  @ManyToOne(() => PropertyCondition, propertyCondition => propertyCondition.properties)
  @JoinColumn({ name: 'propertyConditionId' })
  propertyCondition?: PropertyCondition;

  @OneToMany(() => PropertyFeatureValue, featureValue => featureValue.property)
  featureValues?: PropertyFeatureValue[];

  @OneToMany(() => PropertyImage, image => image.property)
  images?: PropertyImage[];
}