import { EquipmentCategory } from '@modules/equipment-category/entities/equipment-category.entity';
import { Files } from '@modules/file/entities/file.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'equipmemnt' })
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: false })
  isPublished: boolean;

  @Column()
  model: string;

  @Column()
  serial_number: string;

  @Column()
  purchase_date: Date;

  @OneToMany(() => Files, (file) => file.equipment)
  files: Array<Files>;

  @ManyToMany(() => EquipmentCategory, (category) => category.equipmemnts, {
    cascade: true,
  })
  @JoinTable({ name: 'equipmemnt_has_category' })
  categories: Array<EquipmentCategory>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
