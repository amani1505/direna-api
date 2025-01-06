import { Member } from '@modules/member/entities/member.entity';
import { Staff } from '@modules/staffs/entities/staff.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'branches' })
export class Branch {
  @PrimaryGeneratedColumn('uuid') // Automatically generates a UUID
  id: string;

  @Column()
  city: string;

  @Column()
  country: string;

  @Column()
  street: string;

  @Column()
  district: string;

  @Column()
  house_no: string;

  @Column()
  road: string;

  @OneToMany(() => Member, (member) => member.branch)
  members: Array<Member>;

  @OneToMany(() => Staff, (staff) => staff.branch)
  staffs: Array<Staff>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
