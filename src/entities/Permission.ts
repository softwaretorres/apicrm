import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { RolePermission } from './RolePermission';

@Entity('permissions')
@Index(['name'], { unique: true })
@Index(['module'])
@Index(['action'])
@Index(['isActive'])
export class Permission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100, unique: true })
  name!: string;

  @Column({ length: 100 })
  displayName!: string;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ length: 50 })
  module!: string;

  @Column({ length: 50 })
  action!: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relaciones
  @OneToMany(() => RolePermission, rolePermission => rolePermission.permission)
  rolePermissions!: RolePermission[];

  // Métodos auxiliares
  public getFullPermission(): string {
    return `${this.module}.${this.action}`;
  }

  public getRolesCount(): number {
    return this.rolePermissions?.filter(rp => rp.isActive).length || 0;
  }

  public getActiveRoles(): RolePermission[] {
    return this.rolePermissions?.filter(rp => rp.isActive) || [];
  }

  public canBeDeleted(): boolean {
    return this.getRolesCount() === 0;
  }

  public isSystemPermission(): boolean {
    const systemModules = ['system', 'super_admin'];
    return systemModules.includes(this.module);
  }

  public getPermissionLevel(): 'read' | 'write' | 'manage' | 'admin' {
    if (['create', 'update', 'delete'].includes(this.action)) return 'write';
    if (['manage', 'admin'].includes(this.action)) return 'manage';
    if (this.action === 'read') return 'read';
    return 'admin';
  }

  public toJSON() {
    return {
      id: this.id,
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      module: this.module,
      action: this.action,
      fullPermission: this.getFullPermission(),
      level: this.getPermissionLevel(),
      isActive: this.isActive,
      isSystemPermission: this.isSystemPermission(),
      displayOrder: this.displayOrder,
      rolesCount: this.getRolesCount(),
      canBeDeleted: this.canBeDeleted(),
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}