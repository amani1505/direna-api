import { GenderEnum } from '@enum/gender.enum';
import { Branch } from '@modules/branches/entities/branch.entity';
import { Package } from '@modules/packages/entities/package.entity';
import { Service } from '@modules/services/entities/service.entity';
import { User } from '@modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'members' })
export class Member {
  @PrimaryGeneratedColumn('uuid') // Automatically generates a UUID
  id: string;

  @Column()
  first_name: string;

  @Column({ nullable: true })
  middle_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true }) // Ensure the email is unique
  email: string;

  @Column({ unique: true })
  member_number: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: GenderEnum })
  gender: GenderEnum;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ nullable: true }) // For decimals
  weight: string;

  @Column({ nullable: true }) // For decimals
  height: string;

  @Column({ nullable: true })
  goal: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => Branch, (branch) => branch.members)
  branch: Branch;

  @ManyToMany(() => Service, (service) => service.members, {
    cascade: true,
  })
  @JoinTable({ name: 'member_has_services' })
  services: Array<Service>;

  @OneToOne(() => User, (user) => user.member) // Bidirectional relationship
  user: User;

  @ManyToMany(() => Package, (memberPackage) => memberPackage.members)
  @JoinTable({ name: 'gym_packages' })
  packages: Package[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
