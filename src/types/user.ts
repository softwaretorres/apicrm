// src/types/user.ts

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  organizationId?: number;
  invitedBy?: number;
}

export interface UpdateUserDTO {
  name?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  active?: boolean;
}

// Definir UserRoleInfo aquí para evitar referencia circular
export interface UserRoleInfo {
  id: number;
  userId: number;
  roleId: number;
  organizationId?: number;
  assignedBy?: number;
  expiresAt?: Date;
  isActive: boolean;
  isExpired: boolean;
  isValid: boolean;
  createdAt: Date;
  role?: {
    id: number;
    name: string;
    displayName: string;
  };
}

export interface UserProfile {
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
  fullName: string;
  invitationPending: boolean;
  organization?: {
    id: number;
    name: string;
    slug: string;
  };
  activeRoles: UserRoleInfo[];
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  pendingInvitations: number;
}

export interface UserFilters {
  organizationId?: number;
  active?: boolean;
  hasRole?: string;
  query?: string;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface InviteUserDTO {
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  roleId: number;
  organizationId?: number;
  sendEmail?: boolean;
}

export interface UserInvitation {
  id: number;
  email: string;
  name: string;
  token: string;
  expiresAt: Date;
  organizationId?: number;
  roleId: number;
  invitedBy: number;
  createdAt: Date;
  isExpired: boolean;
  organization?: {
    id: number;
    name: string;
  };
  role: {
    id: number;
    name: string;
    displayName: string;
  };
  invitedByUser: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AcceptInvitationDTO {
  token: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}