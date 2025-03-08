import { GenderEnum } from '@enum/gender.enum';
import { Branch } from '@modules/branches/entities/branch.entity';
import { Classes } from '@modules/classes/entities/class.entity';
import { User } from '@modules/user/entities/user.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  OneToOne,
} from 'typeorm';

@Entity({ name: 'staff' })
export class Staff {
  @PrimaryGeneratedColumn('uuid') // Automatically generates a UUID
  id: string;

  @Column()
  fullname: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  staff_number: string;

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

  @ManyToMany(() => Classes, (classes) => classes.instructors)
  classes: Array<Classes>;

  @OneToOne(() => User, (user) => user.staff) // Bidirectional relationship
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
