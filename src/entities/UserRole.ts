import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Index, Unique } from 'typeorm';
import { User } from './User';
import { Role } from './Role';
import { Organization } from './Organization';

@Entity('user_roles')
@Unique(['userId', 'roleId', 'organizationId'])
@Index(['userId'])
@Index(['roleId'])
@Index(['organizationId'])
export class UserRole {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ name: 'user_id' })
  userId!: number;

  @Column({ name: 'role_id' })
  roleId!: number;

  @Column({ name: 'organization_id', nullable: true })
  organizationId?: number;

  @Column({ name: 'assigned_by', nullable: true })
  assignedBy?: number;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  // Relaciones
  @ManyToOne(() => User, user => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Role, role => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @ManyToOne(() => Organization, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_by' })
  assignedByUser?: User;

  // Métodos auxiliares
  public isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  public isValid(): boolean {
    return this.isActive && !this.isExpired();
  }

  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      roleId: this.roleId,
      organizationId: this.organizationId,
      assignedBy: this.assignedBy,
      expiresAt: this.expiresAt,
      isActive: this.isActive,
      isExpired: this.isExpired(),
      isValid: this.isValid(),
      createdAt: this.createdAt,
      role: this.role ? {
        id: this.role.id,
        name: this.role.name,
        displayName: this.role.displayName
      } : undefined
    };
  }
}
