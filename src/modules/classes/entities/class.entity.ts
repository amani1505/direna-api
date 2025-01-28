import { Staff } from '@modules/staffs/entities/staff.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity({ name: 'classes' })
export class Classes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  day: string;

  @Column({ type: 'varchar', length: 50 })
  color: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'time' })
  startTime: string;

  @Column({ type: 'time' })
  endTime: string;

  @ManyToMany(() => Staff, (staff) => staff.classes, {
    cascade: true,
  })
  @JoinTable({ name: 'trainer_has_classes' })
  instructors: Array<Staff>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}