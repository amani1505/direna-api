import { EquipmentCategory } from '@modules/equipment-category/entities/equipment-category.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';

@Injectable()
export class EquipmentCategorySeeder {
  constructor(
    @InjectRepository(EquipmentCategory)
    private readonly _equipmentCategoryRepository: Repository<EquipmentCategory>,
  ) {}

  async seed() {
    const categories = JSON.parse(
      fs.readFileSync('src/assets/equipment-category.json', 'utf8'),
    );

    for (const category of categories) {
      const existingCategory = await this._equipmentCategoryRepository.findOne({
        where: { category_name: category.category_name },
      });

      if (!existingCategory) {
        const newCategory = new EquipmentCategory();
        newCategory.category_name = category.category_name;
        newCategory.image = category.image;

        await this._equipmentCategoryRepository.save(newCategory);
      } else {
        existingCategory.image = category.image;
        await this._equipmentCategoryRepository.save(existingCategory);
      }
    }
  }
}
