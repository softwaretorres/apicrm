import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

/**
 * Entidad para almacenar las conexiones de Google Drive de los usuarios
 */
@Entity('google_drive_connections')
@Index(['userId'], { unique: true })
@Index(['isActive'])
export class GoogleDriveConnection {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'access_token', type: 'text' })
  accessToken!: string;

  @Column({ name: 'refresh_token', type: 'text', nullable: true })
  refreshToken?: string;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @Column({ name: 'google_email', length: 255, nullable: true })
  googleEmail?: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relación con User
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  /**
   * Verifica si el token está expirado
   */
  public isExpired(): boolean {
    return new Date() >= this.expiresAt;
  }

  /**
   * Verifica si necesita refresh (expira en menos de 5 minutos)
   */
  public needsRefresh(): boolean {
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    return fiveMinutesFromNow >= this.expiresAt;
  }

  /**
   * Serialización para JSON
   */
  public toJSON() {
    const { accessToken, refreshToken, ...connection } = this;
    return {
      ...connection,
      hasConnection: true,
      isExpired: this.isExpired(),
      needsRefresh: this.needsRefresh()
    };
  }
}
