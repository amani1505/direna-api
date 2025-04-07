import { Equipment } from '@modules/equipment/entities/equipment.entity';
import { User } from '@modules/user/entities/user.entity';
import {
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'wishlist' })
export class Wishlist {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Equipment)
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;

  @ManyToOne(() => User, (user) => user.wishlists)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
