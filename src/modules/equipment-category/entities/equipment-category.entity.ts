import { Equipment } from '@modules/equipment/entities/equipment.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'equipment_category' })
export class EquipmentCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  category_name: string;

  @Column()
  image: string;

  @ManyToMany(() => Equipment, (equipment) => equipment.categories)
  equipments: Array<Equipment>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
