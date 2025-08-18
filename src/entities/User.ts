import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { OAuthAccessToken } from '../entities/OAuthAccessToken';

@Entity('users') // Laravel usa 'users' por defecto
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  @IsString()
  name!: string;

  @Column({ unique: true })
  @IsEmail()
  email!: string;

  @Column({ name: 'email_verified_at', type: 'timestamp', nullable: true })
  emailVerifiedAt?: Date;

  @Column()
  @IsString()
  @MinLength(6)
  password!: string;

  @Column({ name: 'remember_token', nullable: true })
  rememberToken?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Campos adicionales que Laravel puede tener
  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: true })
  active!: boolean;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  // Relación con tokens OAuth
  @OneToMany(() => OAuthAccessToken, token => token.user)
  accessTokens!: OAuthAccessToken[];

  // Métodos auxiliares
  public getFullName(): string {
    return this.firstName && this.lastName 
      ? `${this.firstName} ${this.lastName}` 
      : this.name;
  }

  public toJSON() {
    const { password, rememberToken, ...user } = this;
    return user;
  }
}