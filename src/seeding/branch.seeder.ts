import { Branch } from '@modules/branches/entities/branch.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';

@Injectable()
export class BranchSeeder {
  constructor(
    @InjectRepository(Branch)
    private readonly _branchRepository: Repository<Branch>,
  ) {}

  async seed() {
    const branches = JSON.parse(
      fs.readFileSync('src/assets/branch.json', 'utf8'),
    );

    for (const branch of branches) {
      const existingBranch = await this._branchRepository.findOne({
        where: { house_no: branch.house_no },
      });

      if (!existingBranch) {
        const direnaBranch = new Branch();
        direnaBranch.city = branch.city;
        direnaBranch.country = branch.country;
        direnaBranch.street = branch.street;
        direnaBranch.district = branch.district;
        direnaBranch.road = branch.road;
        direnaBranch.house_no = branch.house_no;

        await this._branchRepository.save(direnaBranch);
      } else {
        existingBranch.city = branch.city;
        existingBranch.country = branch.country;
        existingBranch.street = branch.street;
        existingBranch.district = branch.district;
        existingBranch.road = branch.road;
        await this._branchRepository.save(existingBranch);
      }
    }
  }
}
