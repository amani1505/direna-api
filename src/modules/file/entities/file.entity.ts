import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'files' })
export class Files {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  file_name: string;

  @Column()
  file_path: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
