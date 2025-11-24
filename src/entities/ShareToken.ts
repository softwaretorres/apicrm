// src/entities/ShareToken.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('share_tokens')
export class ShareToken {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({ unique: true })
    token!: string;

    @Column()
    fileId!: string;

    @Column()
    userId?: number;

    // ✅ NUEVO: Guardar nombre del archivo
    @Column({ nullable: true })
    fileName?: string;

    @Column({ default: false })
    isLocalFile!: boolean;

    // ✅ NUEVO: Ruta local del archivo (si existe)
    @Column({ nullable: true })
    localFilePath!: string;


    @Column({ type: 'timestamp' })
    expiresAt!: Date;

    @Column({ default: 0 })
    downloadCount!: number;

    @Column({ default: true })
    isActive?: boolean;

    @CreateDateColumn()
    createdAt?: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

    isExpired(): boolean {
        return new Date() > this.expiresAt;
    }

    toJSON() {
        return {
            id: this.id,
            token: this.token,
            fileId: this.fileId,
            userId: this.userId,
            fileName: this.fileName, // ✅ Incluir en JSON
            expiresAt: this.expiresAt,
            downloadCount: this.downloadCount,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}