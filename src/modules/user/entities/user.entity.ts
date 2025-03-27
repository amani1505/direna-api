import { GenderEnum } from '@enum/gender.enum';
import { Address } from '@modules/address/entities/address.entity';
import { Blog } from '@modules/blog/entities/blog.entity';
import { Member } from '@modules/member/entities/member.entity';
import { Role } from '@modules/roles/entities/role.entity';
import { Staff } from '@modules/staffs/entities/staff.entity';
import { Exclude } from 'class-transformer';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  first_name: string;

  @Column({ nullable: true })
  middle_name: string;

  @Column()
  last_name: string;

  @Column()
  phone_number: string;

  @Column({ type: 'enum', enum: GenderEnum })
  gender: GenderEnum;

  @Column()
  @Exclude()
  password: string;

  @OneToMany(() => Blog, (blog) => blog.author)
  blog: Array<Blog>;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ nullable: true })
  roleId: string;

  @OneToMany(() => Address, (address) => address.user, {
    cascade: true,
  })
  addresses: Address[];

  @OneToOne(() => Member, (member) => member.user) // One-to-One with Member
  @JoinColumn({ name: 'memberId' })
  member: Member;

  @Column({ nullable: true })
  @Exclude()
  memberId: string;

  @OneToOne(() => Staff, (staff) => staff.user) // One-to-One with Staff
  @JoinColumn({ name: 'staffId' })
  staff: Staff;

  @Column({ nullable: true })
  @Exclude()
  staffId: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
