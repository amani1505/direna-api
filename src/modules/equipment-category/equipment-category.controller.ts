import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { EquipmentCategoryService } from './equipment-category.service';
import { CreateEquipmentCategoryDto } from './dto/create-equipment-category.dto';
import { UpdateEquipmentCategoryDto } from './dto/update-equipment-category.dto';
import { PaginationOptions } from '@interface/pagination-option.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Filename } from '@utils/filename';
import { checkFileExtension } from '@utils/fileCheckExtention';

@Controller('equipment-category')
export class EquipmentCategoryController {
  constructor(
    private readonly _equipmentCategoryService: EquipmentCategoryService,
  ) {}

  @UseInterceptors(
    FileInterceptor('category', {
      storage: diskStorage({
        destination: './uploads/categories',
        filename: Filename,
      }),
      fileFilter: checkFileExtension,
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  @Post()
  create(
    @Body() createEquipmentCategoryDto: CreateEquipmentCategoryDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (createEquipmentCategoryDto !== null) {
      createEquipmentCategoryDto.image = file.path;
    }

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

  @Patch('file/:id')
  @UseInterceptors(
    FileInterceptor('category', {
      storage: diskStorage({
        destination: './uploads/categories',
        filename: Filename,
      }),
      fileFilter: checkFileExtension,
      limits: {
        fileSize: 5 * 1024 * 1024,
        files: 1,
      },
    }),
  )
  updateFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this._equipmentCategoryService.updateCategoryFile(id, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this._equipmentCategoryService.remove(id);
  }
}
