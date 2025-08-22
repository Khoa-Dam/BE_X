import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    JoinColumn,
    RelationId,
    Index,
} from 'typeorm';
import { User } from './User';

@Entity({ name: 'refresh_tokens' })
@Index('ix_refresh_token_hash', ['tokenHash'], { unique: true })
@Index('ix_refresh_validity', ['revoked', 'expiresAt'])
export class RefreshToken {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, (u) => u.refreshTokens, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User;

    // Lấy số FK user_id mà không tạo cột trùng
    @RelationId((rt: RefreshToken) => rt.user)
    userId!: number;

    // SHA-256 hex = 64 chars (bcrypt ~60)
    @Column({ name: 'token_hash', length: 64 })
    tokenHash!: string;

    @Column({ default: false })
    revoked!: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @Column({ name: 'expires_at', type: 'timestamptz' })
    expiresAt!: Date;
}
