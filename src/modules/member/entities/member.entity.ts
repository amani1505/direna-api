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

  @Column({ unique: true }) // Ensure the email is unique
  email: string;

  @Column({ type: 'int' })
  age: number;

  @Column({ type: 'float' }) // For decimals
  weight: number;

  @Column({ type: 'float' }) // For decimals
  height: number;

  @Column()
  goal: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
