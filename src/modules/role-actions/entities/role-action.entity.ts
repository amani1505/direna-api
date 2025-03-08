import { RoleModule } from '@modules/role-modules/entities/role-module.entity';
import { Role } from '@modules/roles/entities/role.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'role_action' })
export class RoleAction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  module_id: string;

  @Column({ unique: true })
  action: string;

  @Column()
  display_name: string;

  @Column()
  description: string;

  @Column()
  display_group: string;

  @Column({ default: false })
  isAllowed: boolean;

  @ManyToOne(() => RoleModule, (roleModule) => roleModule.role_actions)
  module: RoleModule;

  @ManyToMany(() => Role, (role) => role.actions)
  roles: Role[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
