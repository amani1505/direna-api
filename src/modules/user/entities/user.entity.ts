import { Blog } from '@modules/blog/entities/blog.entity';
import { Member } from '@modules/member/entities/member.entity';
import { Role } from '@modules/roles/entities/role.entity';
import { Staff } from '@modules/staffs/entities/staff.entity';

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
  password: string;

  @OneToMany(() => Blog, (blog) => blog.author)
  blog: Array<Blog>;

  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  role: Role;

  @Column({ nullable: true })
  roleId: string;

  @OneToOne(() => Member, (member) => member.user) // One-to-One with Member
  @JoinColumn({ name: 'memberId' })
  member: Member;
  @Column({ nullable: true })
  memberId: string;

  @OneToOne(() => Staff, (staff) => staff.user) // One-to-One with Staff
  @JoinColumn({ name: 'staffId' })
  staff: Staff;

  @Column({ nullable: true })
  staffId: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
