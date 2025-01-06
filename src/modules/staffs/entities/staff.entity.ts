import { GenderEnum } from '@enum/gender.enum';
import { Branch } from '@modules/branches/entities/branch.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'staff' })
export class Staff {
  @PrimaryGeneratedColumn('uuid') // Automatically generates a UUID
  id: string;

  @Column()
  fullname: string;

  @Column({ unique: true }) // Ensure the email is unique
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: GenderEnum })
  gender: GenderEnum;

  @ManyToOne(() => Branch, (branch) => branch.staffs)
  branch: Branch;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
