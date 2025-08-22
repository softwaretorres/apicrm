import { Entity,  PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index  } from 'typeorm';
import { RolePermission } from './RolePermission';
import { UserRole } from './UserRole';

@Entity('roles')
@Index(['name'], { unique: true })
@Index(['isActive'], {unique: false})
@Index(['isSystemRole'], {unique: false})
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 50, unique: true })
  name!: string;

  @Column({ length: 100 })
  displayName!: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ name: 'is_system_role', default: false })
  isSystemRole!: boolean;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @OneToMany(() => UserRole, userRole => userRole.role)
  userRoles!: UserRole[];

  @OneToMany(() => RolePermission, rolePermission => rolePermission.role)
  rolePermissions!: RolePermission[];

  // Métodos auxiliares
  public isSuperAdmin(): boolean {
    return this.name === 'super_admin';
  }

  public isAdmin(): boolean {
    return this.name === 'admin';
  }

  public canBeDeleted(): boolean {
    return !this.isSystemRole;
  }

  public canBeModified(): boolean {
    return !this.isSystemRole;
  }

  public getUsersCount(): number {
    return this.userRoles?.filter(ur => ur.isValid()).length || 0;
  }

  public getPermissionsCount(): number {
    return this.rolePermissions?.filter(rp => rp.isActive).length || 0;
  }

  public getActivePermissions(): RolePermission[] {
    return this.rolePermissions?.filter(rp => rp.isActive) || [];
  }

  public hasPermission(permissionName: string): boolean {
    return this.getActivePermissions().some(rp => 
      rp.permission?.name === permissionName
    );
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      isSystemRole: this.isSystemRole,
      isActive: this.isActive,
      displayOrder: this.displayOrder,
      usersCount: this.getUsersCount(),
      permissionsCount: this.getPermissionsCount(),
      canBeDeleted: this.canBeDeleted(),
      canBeModified: this.canBeModified(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      permissions: this.rolePermissions?.filter(rp => rp.isActive).map(rp => rp.permission) || []
    };
  }
}
