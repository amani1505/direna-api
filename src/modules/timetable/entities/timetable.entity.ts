import { Classes } from '@modules/classes/entities/class.entity';
import { Staff } from '@modules/staffs/entities/staff.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'timetables' })
export class Timetable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp' })
  end_time: Date;

  @Column()
  max_participants: number;

  @Column({ default: 0 })
  current_participants: number;

  @Column({ type: 'varchar', length: 50, default: '#ff4836' })
  color: string;

  @ManyToOne(() => Classes, (gymClass) => gymClass.timetables)
  class: Classes;

  @Column()
  classId: string;

  @ManyToOne(() => Staff, (trainer) => trainer.timetables)
  trainer: Staff;

  @Column()
  trainerId: string;

  //   @ManyToOne(() => Room, (room) => room.timetableEntries)
  //   room: Room;

  //   @Column()
  //   roomId: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
