import { RoleAction } from '@modules/role-actions/entities/role-action.entity';
import { RoleModule } from '@modules/role-modules/entities/role-module.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { Repository } from 'typeorm';

@Injectable()
export class RoleActionsSeeder {
  constructor(
    @InjectRepository(RoleAction)
    private readonly _roleActionRepository: Repository<RoleAction>,
    @InjectRepository(RoleModule)
    private readonly _roleModuleRepository: Repository<RoleModule>,
  ) {}

  async seed() {
    const roleActions = JSON.parse(
      fs.readFileSync('src/assets/role-actions.json', 'utf8'),
    );

    for (const action of roleActions) {
      const existingRoleAction = await this._roleActionRepository.findOne({
        where: { action: action.action },
      });

      const roleModule = await this._roleModuleRepository.findOne({
        where: { name: action.module_name },
      });

      if (!existingRoleAction) {
        const newRoleAction = new RoleAction();
        newRoleAction.action = action.action;
        newRoleAction.display_name = action.display_name;
        newRoleAction.display_group = action.display_group;
        newRoleAction.description = action.description;
        newRoleAction.module_id = roleModule.id;

        await this._roleActionRepository.save(newRoleAction);
      } else {
        existingRoleAction.display_name = action.display_name;
        existingRoleAction.display_group = action.display_group;
        existingRoleAction.description = action.description;
        existingRoleAction.module_id = roleModule.id;

        await this._roleActionRepository.save(existingRoleAction);
      }
    }
  }
}
