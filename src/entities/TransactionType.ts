import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Property } from './Property';

@Entity('transaction_types')
export class TransactionType {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({ length: 100, unique: true })
  name?: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ default: true })
  isActive?: boolean;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @OneToMany(() => Property, property => property.transactionType)
  properties?: Property[];
}
