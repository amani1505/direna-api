import { EquipmentCategory } from '@modules/equipment-category/entities/equipment-category.entity';
import { Files } from '@modules/file/entities/file.entity';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'equipment' })
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
  used_for: string;
  
    @Column()
  status: string;

  @Column()
  purchase_date: Date;

  @Check('price > -1')
  @Column({ type: 'real', unsigned: true })
  price: number;

  @Check('quantity > -1')
  @Column({ type: 'smallint', unsigned: true })
  quantity: number;

  @OneToMany(() => Files, (file) => file.equipment)
  files: Array<Files>;

  @ManyToMany(() => EquipmentCategory, (category) => category.equipmemnts, {
    cascade: true,
  })
  @JoinTable({ name: 'equipment_has_category' })
  categories: Array<EquipmentCategory>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
