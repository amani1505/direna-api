import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'members' })
export class Member {
  @PrimaryGeneratedColumn('uuid') // Automatically generates a UUID
  id: string;

  @Column()
  fullname: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true }) // Ensure the email is unique
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ type: 'int', nullable: true })
  age: number;

  @Column({ type: 'float', nullable: true }) // For decimals
  weight: number;

  @Column({ type: 'float', nullable: true }) // For decimals
  height: number;

  @Column({ nullable: true })
  goal: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
