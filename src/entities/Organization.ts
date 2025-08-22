import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { User } from './User';

@Entity('organizations')
@Index(['slug'], { unique: true })
@Index(['isActive'])
@Index(['subscriptionPlan'])
export class Organization {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100, unique: true })
  slug!: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  // Información de contacto
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

  @Column({ length: 50, nullable: true })
  phone?: string;

  @Column({ length: 255, nullable: true })
  email?: string;

  @Column({ length: 500, nullable: true })
  website?: string;

  @Column({ length: 500, nullable: true })
  logo?: string;

  // Información legal y licencias
  @Column({ name: 'license_number', length: 100, nullable: true })
  licenseNumber?: string;

  @Column({ name: 'tax_id', length: 50, nullable: true })
  taxId?: string;

  // Suscripción y facturación
  @Column({ name: 'subscription_plan', length: 50, default: 'basic' })
  subscriptionPlan!: string; // basic, premium, enterprise

  @Column({ name: 'subscription_expires_at', type: 'timestamp', nullable: true })
  subscriptionExpiresAt?: Date;

  @Column({ name: 'max_users', type: 'int', default: 5 })
  maxUsers!: number;

  @Column({ name: 'max_properties', type: 'int', default: 100 })
  maxProperties!: number;

  // Configuraciones personalizadas
  @Column({ type: 'json', nullable: true })
  settings?: {
    theme?: string;
    currency?: string;
    timezone?: string;
    language?: string;
    features?: string[];
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    branding?: {
      primaryColor?: string;
      secondaryColor?: string;
      customCss?: string;
    };
  };

  // Métricas
  @Column({ name: 'properties_count', type: 'int', default: 0 })
  propertiesCount!: number;

  @Column({ name: 'users_count', type: 'int', default: 0 })
  usersCount!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ name: 'is_verified', default: false })
  isVerified!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @OneToMany(() => User, user => user.organization)
  users!: User[];

  // Métodos auxiliares
  public isSubscriptionActive(): boolean {
    if (!this.subscriptionExpiresAt) return false;
    return new Date() <= this.subscriptionExpiresAt;
  }

  public canAddMoreUsers(): boolean {
    if (this.subscriptionPlan === 'enterprise') return true;
    return this.usersCount < this.maxUsers;
  }

  public canAddMoreProperties(): boolean {
    if (this.subscriptionPlan === 'enterprise') return true;
    return this.propertiesCount < this.maxProperties;
  }

  public getSubscriptionStatus(): 'active' | 'expired' | 'trial' | 'suspended' {
    if (!this.isActive) return 'suspended';
    if (!this.subscriptionExpiresAt) return 'trial';
    return this.isSubscriptionActive() ? 'active' : 'expired';
  }

  public getRemainingDays(): number {
    if (!this.subscriptionExpiresAt) return 0;
    const now = new Date();
    const diff = this.subscriptionExpiresAt.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  public getFeatures(): string[] {
    const baseFeatures = ['properties', 'users', 'basic_reports'];
    const planFeatures: Record<string, string[]> = {
      basic: [...baseFeatures],
      premium: [...baseFeatures, 'advanced_reports', 'api_access', 'custom_branding'],
      enterprise: [...baseFeatures, 'advanced_reports', 'api_access', 'custom_branding', 'white_label', 'priority_support']
    };
    
    const features = planFeatures[this.subscriptionPlan] || baseFeatures;
    const customFeatures = this.settings?.features || [];
    
    return [...new Set([...features, ...customFeatures])];
  }

  public hasFeature(feature: string): boolean {
    return this.getFeatures().includes(feature);
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      slug: this.slug,
      description: this.description,
      address: this.address,
      city: this.city,
      state: this.state,
      zipCode: this.zipCode,
      country: this.country,
      phone: this.phone,
      email: this.email,
      website: this.website,
      logo: this.logo,
      licenseNumber: this.licenseNumber,
      taxId: this.taxId,
      subscriptionPlan: this.subscriptionPlan,
      subscriptionExpiresAt: this.subscriptionExpiresAt,
      maxUsers: this.maxUsers,
      maxProperties: this.maxProperties,
      propertiesCount: this.propertiesCount,
      usersCount: this.usersCount,
      isActive: this.isActive,
      isVerified: this.isVerified,
      subscriptionStatus: this.getSubscriptionStatus(),
      remainingDays: this.getRemainingDays(),
      features: this.getFeatures(),
      settings: this.settings,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}