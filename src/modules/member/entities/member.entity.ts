import { GenderEnum } from '@enum/gender.enum';
import { Branch } from '@modules/branches/entities/branch.entity';
import { Service } from '@modules/services/entities/service.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'members' })
export class Member {
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

  @Column({ type: 'enum', enum: GenderEnum })
  gender: GenderEnum;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column() // For decimals
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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
