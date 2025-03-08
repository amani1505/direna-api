import { RoleModule } from '@modules/role-modules/entities/role-module.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { Repository } from 'typeorm';

@Injectable()
export class RoleModulesSeeder {
  constructor(
    @InjectRepository(RoleModule)
    private readonly _roleModuleRepository: Repository<RoleModule>,
  ) {}

  async seed() {
    const roleModules = JSON.parse(
      fs.readFileSync('src/assets/role-modules.json', 'utf8'),
    );

    for (const role of roleModules) {
      const existingRoleModule = await this._roleModuleRepository.findOne({
        where: { name: role.name },
      });

      if (!existingRoleModule) {
        const newRole = new RoleModule();
        newRole.name = role.name;
        newRole.description = role.description;

        await this._roleModuleRepository.save(newRole);
      } else {
        existingRoleModule.description = role.description;
        await this._roleModuleRepository.save(existingRoleModule);
      }
    }
  }
}
