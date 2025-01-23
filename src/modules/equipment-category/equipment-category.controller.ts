import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { EquipmentCategoryService } from './equipment-category.service';
import { CreateEquipmentCategoryDto } from './dto/create-equipment-category.dto';
import { UpdateEquipmentCategoryDto } from './dto/update-equipment-category.dto';
import { PaginationOptions } from '@interface/pagination-option.interface';

@Controller('equipment-category')
export class EquipmentCategoryController {
  constructor(
    private readonly _equipmentCategoryService: EquipmentCategoryService,
  ) {}

  @Post()
  create(@Body() createEquipmentCategoryDto: CreateEquipmentCategoryDto) {
    return this._equipmentCategoryService.create(createEquipmentCategoryDto);
  }

  @Get()
  findAll(@Query() query: PaginationOptions) {
    return this._equipmentCategoryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: any) {
    return this._equipmentCategoryService.findOne(id, query);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEquipmentCategoryDto: UpdateEquipmentCategoryDto,
  ) {
    return this._equipmentCategoryService.update(
      id,
      updateEquipmentCategoryDto,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this._equipmentCategoryService.remove(id);
  }
}
