import { RoleAction } from '@modules/role-actions/entities/role-action.entity';
import { User } from '@modules/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column()
  short_name: string;

  @ManyToMany(() => RoleAction, (roleAction) => roleAction.roles)
  actions: RoleAction[];

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => User, (user) => user.role)
  users: Array<User>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
