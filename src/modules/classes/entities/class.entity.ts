import { Timetable } from '@modules/timetable/entities/timetable.entity';
import {
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Entity,
  OneToMany,
} from 'typeorm';

@Entity({ name: 'classes' })
export class Classes {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  // @Column({ type: 'varchar', length: 50 })
  // day: string;

  // @Column({ type: 'varchar', length: 50, default: '#ff4836' })
  // color: string;

  @Column({ type: 'int', default: 20 })
  capacity: number;

  // @Column({ type: 'time' })
  // startTime: string;

  // @Column({ type: 'time' })
  // endTime: string;

  @Column()
  image: string;

  // @ManyToMany(() => Staff, (staff) => staff.classes, {
  //   cascade: true,
  // })
  // @JoinTable({ name: 'trainer_has_classes' })
  // instructors: Array<Staff>;

  @Column({ default: 60 }) // Default class duration in minutes
  default_duration: number;

  @Column({ default: true })
  is_active: boolean;

  @OneToMany(() => Timetable, (timetable) => timetable.class)
  timetables: Timetable[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
