import { RoleAction } from '@modules/role-actions/entities/role-action.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'role_module' })
export class RoleModule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: true })
  isActive: boolean;

  @Column()
  description: string;

  @OneToMany(() => RoleAction, (roleAction) => roleAction.module)
  role_actions: RoleAction[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
