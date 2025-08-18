import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { OAuthAccessToken } from './OAuthAccessToken';

@Entity('oauth_clients')
export class OAuthClient {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id', nullable: true })
  userId?: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  secret?: string;

  @Column({ name: 'provider', nullable: true })
  provider?: string;

  @Column('text')
  redirect!: string;

  @Column({ name: 'personal_access_client', default: false })
  personalAccessClient!: boolean;

  @Column({ name: 'password_client', default: false })
  passwordClient!: boolean;

  @Column({ default: false })
  revoked!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relación con tokens de acceso
  @OneToMany(() => OAuthAccessToken, token => token.client)
  accessTokens!: OAuthAccessToken[];

  // Métodos auxiliares
  public isPersonalAccessClient(): boolean {
    return this.personalAccessClient;
  }

  public isPasswordClient(): boolean {
    return this.passwordClient;
  }

  public isRevoked(): boolean {
    return this.revoked;
  }

  public toJSON() {
    const { secret, ...client } = this;
    return client;
  }
}