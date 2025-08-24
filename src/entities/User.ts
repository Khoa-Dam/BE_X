import {
    Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Post } from './Post';
import { RefreshToken } from './RefreshToken';
import { FileEntity } from './FileEntity';

export enum Role { USER = 'USER', ADMIN = 'ADMIN' }
export enum AuthProvider { LOCAL = 'LOCAL', GOOGLE = 'GOOGLE' }

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn() id!: number;
    @Column({ length: 100 }) name!: string;
    @Column({ length: 191, unique: true }) email!: string;

    @Column({ name: 'password_hash', length: 191, nullable: true })
    passwordHash!: string | null

    @Column({ type: 'enum', enum: Role, enumName: 'user_role', default: Role.USER })
    role!: Role;

    @Column({ name: 'google_id', length: 64, nullable: true, unique: true })
    googleId!: string | null;

    @Column({ type: 'enum', enum: AuthProvider, enumName: 'auth_provider', default: AuthProvider.LOCAL })
    provider!: AuthProvider;

    @ManyToOne(() => FileEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'avatar_id' })
    avatar?: FileEntity | null;

    @Column({ name: 'avatar_id', type: 'int', nullable: true })
    avatarId?: number | null;

    @OneToMany(() => Post, (p) => p.author) posts!: Post[];
    @OneToMany(() => RefreshToken, (t) => t.user) refreshTokens!: RefreshToken[];

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;
}
