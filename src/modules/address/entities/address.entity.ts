import { User } from '@modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'address' })
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column({ nullable: true })
  state: string;

  @Column()
  district: string;

  @Column({ nullable: true })
  zip_code: string;

  @Column()
  country: string;

  @Column()
  type: string;

  @Column({ default: false })
  is_default: boolean;

  @ManyToOne(() => User, (user) => user.addresses)
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
