// types/auth.ts
export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  active: boolean;
  lastLoginAt?: Date;
  organizationId?: number;
  invitedBy?: number;
  invitationAcceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  
  // Información extendida para autenticación
  fullName: string;
  invitationPending: boolean;
  isActive: boolean; // Alias para active
  
  // Métodos de conveniencia para roles (funciones async)
  hasRole: (roleName: string) => Promise<boolean>;
  hasPermission: (permissionName: string) => Promise<boolean>;
  canAccessModule: (module: string) => Promise<boolean>;
  isSuperAdmin: () => Promise<boolean>;
  isAdmin: () => Promise<boolean>;
  
  // Información de roles (se cargan al autenticar)
  activeRoles?: Array<{
    id: number;
    userId: number;
    roleId: number;
    organizationId?: number;
    role?: {
      id: number;
      name: string;
      displayName: string;
    };
  }>;
}

export interface TokenPayload {
  sub: string; // user ID
  jti: string; // token ID
  scopes: string[];
  iat: number; // issued at
  exp: number; // expires at
  [key: string]: any;
}

export interface AuthResponse {
  user: AuthenticatedUser;
  token: string;
  expiresAt: Date;
  scopes: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
  scopes?: string[];
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  organizationId?: number;
}

// Extender la interfaz Request de Express
declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      token?: string;
    }
  }
}