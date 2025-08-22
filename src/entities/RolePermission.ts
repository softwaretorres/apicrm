import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index, Unique } from 'typeorm';
import { Role } from './Role';
import { Permission } from './Permission';
import { User } from './User';

@Entity('role_permissions')
@Unique(['roleId', 'permissionId'])
@Index(['roleId'])
@Index(['permissionId'])
export class RolePermission {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'role_id' })
  roleId!: number;

  @Column({ name: 'permission_id' })
  permissionId!: number;

  @Column({ name: 'granted_by', nullable: true })
  grantedBy?: number;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @ManyToOne(() => Role, role => role.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @ManyToOne(() => Permission, permission => permission.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission!: Permission;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'granted_by' })
  grantedByUser?: User;

  public toJSON() {
    return {
      id: this.id,
      roleId: this.roleId,
      permissionId: this.permissionId,
      grantedBy: this.grantedBy,
      isActive: this.isActive,
      createdAt: this.createdAt,
      permission: this.permission ? {
        id: this.permission.id,
        name: this.permission.name,
        displayName: this.permission.displayName,
        module: this.permission.module,
        action: this.permission.action
      } : undefined
    };
  }
}
