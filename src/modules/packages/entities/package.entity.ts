import { Member } from '@modules/member/entities/member.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'packages' })
export class Package {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'real', unsigned: true })
  price: number;

  @Column({ type: 'integer', unsigned: true })
  duration_days: number;

  @Column({ default: true })
  is_active: boolean;

  //   @Column({ type: 'integer', unsigned: true, default: 0 })
  //   max_sessions: number;

  @Column({ default: false })
  is_unlimited: boolean;

  @ManyToMany(() => Member, (member) => member.packages)
  members: Member[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
