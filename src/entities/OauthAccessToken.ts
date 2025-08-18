import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';
import { OAuthClient } from './OAuthClient';

@Entity('oauth_access_tokens')
export class OAuthAccessToken {
  @PrimaryColumn()
  id!: string;

  @Column({ name: 'user_id', nullable: true })
  userId?: number;

  @Column({ name: 'client_id' })
  clientId!: number;

  @Column({ nullable: true })
  name?: string;

  @Column('text')
  scopes!: string;

  @Column({ default: false })
  revoked!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamp' })
  expiresAt!: Date;

  @ManyToOne(() => User, user => user.accessTokens)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => OAuthClient, client => client.accessTokens)
  @JoinColumn({ name: 'client_id' })
  client!: OAuthClient;

  // Métodos auxiliares
  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  public isRevoked(): boolean {
    return this.revoked;
  }

  public isValid(): boolean {
    return !this.isExpired() && !this.isRevoked();
  }

  public getScopesArray(): string[] {
    try {
      return JSON.parse(this.scopes);
    } catch {
      return [];
    }
  }

  public hasScope(scope: string): boolean {
    const scopes = this.getScopesArray();
    return scopes.includes('*') || scopes.includes(scope);
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      scopes: this.getScopesArray(),
      revoked: this.revoked,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      expiresAt: this.expiresAt
    };
  }
}