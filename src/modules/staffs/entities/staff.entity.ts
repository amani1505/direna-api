import { GenderEnum } from '@enum/gender.enum';
import { Branch } from '@modules/branches/entities/branch.entity';
import { Timetable } from '@modules/timetable/entities/timetable.entity';
import { User } from '@modules/user/entities/user.entity';

import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'staff' })
export class Staff {
  @PrimaryGeneratedColumn('uuid') // Automatically generates a UUID
  id: string;

  @Column()
  first_name: string;

  @Column({ nullable: true })
  middle_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  staff_number: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'enum', enum: GenderEnum })
  gender: GenderEnum;

  @ManyToOne(() => Branch, (branch) => branch.staffs)
  branch: Branch;

  @OneToMany(() => Timetable, (timetable) => timetable.trainer)
  timetables: Array<Timetable>;

  @OneToOne(() => User, (user) => user.staff) // Bidirectional relationship
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
