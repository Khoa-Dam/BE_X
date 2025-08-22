import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Post } from './Post';
import { RefreshToken } from './RefreshToken';
import { FileEntity } from './FileEntity';

export enum Role {
    USER = 'USER',
    ADMIN = 'ADMIN',
}

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ length: 100 })
    name!: string;

    @Column({ length: 191, unique: true })
    email!: string;

    @Column({ name: 'password_hash', length: 191 })
    passwordHash!: string;

    // Enum có tên cố định trong DB
    @Column({ type: 'enum', enum: Role, enumName: 'user_role', default: Role.USER })
    role!: Role;

    // Avatar (optional)
    @ManyToOne(() => FileEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'avatar_id' })
    avatar?: FileEntity | null;

    @Column({ name: 'avatar_id', type: 'int', nullable: true })
    avatarId?: number | null;

    @OneToMany(() => Post, (p) => p.author)
    posts!: Post[];

    @OneToMany(() => RefreshToken, (t) => t.user)
    refreshTokens!: RefreshToken[];

    // timestamptz
    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;
}
