import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { Post } from './Post';

@Entity({ name: 'files' })
export class FileEntity {
    @PrimaryGeneratedColumn() id!: number;
    @Column() filename!: string;
    @Column() path!: string;
    @Column({ nullable: true }) mime?: string;
    @Column({ type: 'int', nullable: true }) size?: number;
    @Column({ type: 'char', length: 64, nullable: true }) sha256?: string;
    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' }) createdAt!: Date;

    @OneToMany(() => Post, p => p.cover) posts!: Post[];
}
