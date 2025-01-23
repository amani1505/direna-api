import { Role } from '@modules/roles/entities/role.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { Repository } from 'typeorm';

@Injectable()
export class RolesSeeder {
  constructor(
    @InjectRepository(Role)
    private readonly _roleRepository: Repository<Role>,
  ) {}

  async seed() {
    const roles = JSON.parse(fs.readFileSync('src/assets/roles.json', 'utf8'));

    for (const role of roles) {
      const existingRole = await this._roleRepository.findOne({
        where: { name: role.name },
      });

      if (!existingRole) {
        const newRole = new Role();
        newRole.name = role.name;
        newRole.description = role.description;

        await this._roleRepository.save(newRole);
      } else {
        existingRole.description = role.description;
        await this._roleRepository.save(existingRole);
      }
    }
  }
}
