import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { IsEmail, IsString, MinLength } from 'class-validator';
import { OAuthAccessToken } from './OAuthAccessToken';
import { UserRole } from './UserRole';
import { Organization } from './Organization';
import { Property } from './Property';

@Entity('users')
@Index(['email'], { unique: true })
@Index(['organizationId'])
@Index(['active']) // Cambiado de isActive a active para compatibilidad
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: false })
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

  // Información adicional
  @Column({ name: 'first_name', nullable: true })
  firstName?: string;

  @Column({ name: 'last_name', nullable: true })
  lastName?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  avatar?: string;

  // Cambiado de isActive a active para compatibilidad con tu AuthMiddleware
  @Column({ default: true })
  active!: boolean;

  @Column({ name: 'last_login_at', type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  // Relación con organización
  @Column({ name: 'organization_id', nullable: true })
  organizationId?: number;

  // Sistema de invitaciones
  @Column({ name: 'invited_by', nullable: true })
  invitedBy?: number;

  @Column({ name: 'invitation_accepted_at', type: 'timestamp', nullable: true })
  invitationAcceptedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @OneToMany(() => OAuthAccessToken, token => token.user)
  accessTokens!: OAuthAccessToken[];

  @OneToMany(() => UserRole, userRole => userRole.user)
  userRoles!: UserRole[];

  @OneToMany(() => Property, property => property.user)
  properties!: Property[];

  @ManyToOne(() => Organization, organization => organization.users, { nullable: true })
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'invited_by' })
  invitedByUser?: User;

  // Métodos auxiliares para roles y permisos
  public async hasRole(roleName: string): Promise<boolean> {
    if (!this.userRoles) return false;
    
    return this.userRoles.some(userRole => 
      userRole.isValid() && 
      userRole.role?.name === roleName
    );
  }

  public async isSuperAdmin(): Promise<boolean> {
    return this.hasRole('super_admin');
  }

  public async isAdmin(): Promise<boolean> {
    return this.hasRole('admin');
  }

  public async hasPermission(permissionName: string): Promise<boolean> {
    if (!this.userRoles) return false;

    // Super admin tiene todos los permisos
    if (await this.isSuperAdmin()) return true;

    return this.userRoles.some(userRole => {
      if (!userRole.isValid()) return false;
      
      return userRole.role?.rolePermissions?.some(rolePermission =>
        rolePermission.isActive && 
        rolePermission.permission?.name === permissionName
      ) || false;
    });
  }

  public async canAccessModule(module: string): Promise<boolean> {
    if (await this.isSuperAdmin()) return true;

    return this.userRoles.some(userRole => {
      if (!userRole.isValid()) return false;
      
      return userRole.role?.rolePermissions?.some(rolePermission =>
        rolePermission.isActive && 
        rolePermission.permission?.module === module
      ) || false;
    });
  }

  public getActiveRoles(): UserRole[] {
    return this.userRoles?.filter(userRole => userRole.isValid()) || [];
  }

  public belongsToOrganization(organizationId: number): boolean {
    return this.organizationId === organizationId;
  }

  public getFullName(): string {
    return this.firstName && this.lastName 
      ? `${this.firstName} ${this.lastName}` 
      : this.name;
  }

  public isInvitationPending(): boolean {
    return !this.invitationAcceptedAt && !!this.invitedBy;
  }

  // Getter para mantener compatibilidad con código que use isActive
  public get isActive(): boolean {
    return this.active;
  }

  // Setter para mantener compatibilidad con código que use isActive
  public set isActive(value: boolean) {
    this.active = value;
  }

  // Método para obtener tokens válidos
  public getValidTokens(): OAuthAccessToken[] {
    return this.accessTokens?.filter(token => token.isValid()) || [];
  }

  // Método para revocar todos los tokens
  public async revokeAllTokens(): Promise<void> {
    if (this.accessTokens) {
      for (const token of this.accessTokens) {
        token.revoked = true;
      }
    }
  }

  // Método para obtener permisos como array de strings
  public async getPermissionNames(): Promise<string[]> {
    if (!this.userRoles) return [];

    const permissions: string[] = [];
    const permissionSet = new Set<string>();

    for (const userRole of this.userRoles) {
      if (!userRole.isValid()) continue;
      
      if (userRole.role?.rolePermissions) {
        for (const rolePermission of userRole.role.rolePermissions) {
          if (rolePermission.isActive && rolePermission.permission) {
            const permissionName = rolePermission.permission.name;
            if (!permissionSet.has(permissionName)) {
              permissions.push(permissionName);
              permissionSet.add(permissionName);
            }
          }
        }
      }
    }

    return permissions;
  }

  // Método para verificar múltiples permisos
  public async hasAnyPermission(permissionNames: string[]): Promise<boolean> {
    if (await this.isSuperAdmin()) return true;

    const userPermissions = await this.getPermissionNames();
    return permissionNames.some(permission => userPermissions.includes(permission));
  }

  // Método para verificar todos los permisos
  public async hasAllPermissions(permissionNames: string[]): Promise<boolean> {
    if (await this.isSuperAdmin()) return true;

    const userPermissions = await this.getPermissionNames();
    return permissionNames.every(permission => userPermissions.includes(permission));
  }

  // Método para serialización JSON
  public toJSON() {
    const { password, rememberToken, ...user } = this;
    return {
      ...user,
      fullName: this.getFullName(),
      invitationPending: this.isInvitationPending(), // Cambiar nombre para evitar conflicto
      activeRoles: this.getActiveRoles().map(ur => ur.toJSON()),
      // Mantener compatibilidad con ambos nombres
      isActive: this.active,
      active: this.active
    };
  }

  // Método estático para crear usuario con hash de password
  public static async createWithHashedPassword(userData: {
    name: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    organizationId?: number;
  }): Promise<User> {
    // Aquí deberías hashear la contraseña usando bcrypt
    // const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const user = new User();
    Object.assign(user, {
      ...userData,
      // password: hashedPassword, // Descomenta cuando implementes bcrypt
      active: true,
      emailVerifiedAt: new Date()
    });

    return user;
  }

  // Método para verificar contraseña
  public async verifyPassword(password: string): Promise<boolean> {
    // Aquí deberías usar bcrypt para verificar
    // return bcrypt.compare(password, this.password);
    
    // Por ahora comparación directa (NO usar en producción)
    return this.password === password;
  }
}