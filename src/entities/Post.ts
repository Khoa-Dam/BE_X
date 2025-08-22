import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    JoinColumn
} from 'typeorm';
import { User } from './User';
import { FileEntity } from './FileEntity';

export enum PostStatus { DRAFT = 'DRAFT', PUBLISHED = 'PUBLISHED' }

@Entity({ name: 'posts' })
@Index('idx_posts_title', ['title'])
@Index('idx_posts_created_at', ['createdAt'])
export class Post {
    @PrimaryGeneratedColumn()
    id!: number;

    @ManyToOne(() => User, u => u.posts, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'author_id' })
    author!: User;

    @Column({ name: 'author_id' })
    authorId!: number;

    @Column({ length: 200 })
    title!: string;

    @Column({ length: 220, unique: true })
    slug!: string;

    @Column({ type: 'text', nullable: true })
    content?: string;

    @Column({ type: 'enum', enum: PostStatus, default: PostStatus.PUBLISHED })
    status!: PostStatus;

    @ManyToOne(() => FileEntity, f => f.posts, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'cover_id' })
    cover?: FileEntity | null;

    @Column({ name: 'cover_id', type: 'int', nullable: true })
    coverId?: number | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
    updatedAt!: Date;
}
