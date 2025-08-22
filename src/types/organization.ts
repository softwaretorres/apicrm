// src/types/organization.ts

export interface CreateOrganizationDTO {
  name: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  licenseNumber?: string;
  taxId?: string;
  subscriptionPlan?: string;
  maxUsers?: number;
  maxProperties?: number;
  adminUser: {
    name: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
  };
}

export interface UpdateOrganizationDTO {
  name?: string;
  description?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  licenseNumber?: string;
  taxId?: string;
  logo?: string;
  settings?: OrganizationSettings;
  isActive?: boolean;
  isVerified?: boolean;
}

export interface UpdateSubscriptionDTO {
  subscriptionPlan: string;
  subscriptionExpiresAt?: Date;
  maxUsers?: number;
  maxProperties?: number;
}

export interface OrganizationSettings {
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
  [key: string]: any;
}

export interface OrganizationStats {
  totalUsers: number;
  activeUsers: number;
  totalProperties: number;
  activeProperties: number;
  subscriptionStatus: 'active' | 'expired' | 'trial' | 'suspended';
  remainingDays: number;
  usagePercentage: {
    users: number;
    properties: number;
  };
}

export interface SystemStats {
  totalOrganizations: number;
  activeOrganizations: number;
  totalUsers: number;
  totalProperties: number;
  subscriptionBreakdown: Record<string, number>;
  revenueProjection: number;
}

export interface OrganizationAlert {
  type: string;
  severity: 'info' | 'warning' | 'error';
  message: string;
  actionRequired?: boolean;
}

export interface OrganizationFilters {
  isActive?: boolean;
  subscriptionPlan?: string;
  isVerified?: boolean;
}

// Enums para planes de suscripción
export enum SubscriptionPlans {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

// Enums para estados de suscripción
export enum SubscriptionStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  TRIAL = 'trial',
  SUSPENDED = 'suspended'
}

// Configuraciones por defecto para cada plan
export const SUBSCRIPTION_LIMITS = {
  [SubscriptionPlans.BASIC]: {
    maxUsers: 5,
    maxProperties: 100,
    features: ['properties', 'users', 'basic_reports']
  },
  [SubscriptionPlans.PREMIUM]: {
    maxUsers: 25,
    maxProperties: 500,
    features: ['properties', 'users', 'basic_reports', 'advanced_reports', 'api_access', 'custom_branding']
  },
  [SubscriptionPlans.ENTERPRISE]: {
    maxUsers: -1, // ilimitado
    maxProperties: -1, // ilimitado
    features: ['properties', 'users', 'basic_reports', 'advanced_reports', 'api_access', 'custom_branding', 'white_label', 'priority_support']
  }
} as const;