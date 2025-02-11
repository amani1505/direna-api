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
  UploadedFiles,
  UploadedFile,
} from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { PaginationOptions } from '@interface/pagination-option.interface';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly _equipmentService: EquipmentService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('equipmentImages', 4, {
      storage: diskStorage({
        destination: './uploads/equipments',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `equipment-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  create(
    @Body() createEquipmentDto: CreateEquipmentDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return this._equipmentService.create(createEquipmentDto, files);
  }

  @Post('file/:id')
  @UseInterceptors(
    FileInterceptor('update', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);

          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  uploadEquipmentImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this._equipmentService.uploadEquipmentImage(id, file);
  }

  @Get()
  findAll(@Query() query: PaginationOptions) {
    return this._equipmentService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: any) {
    return this._equipmentService.findOne(id, query);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEquipmentDto: UpdateEquipmentDto,
  ) {
    return this._equipmentService.update(id, updateEquipmentDto);
  }

  @Patch('file/:id')
  @UseInterceptors(
    FileInterceptor('update', {
      storage: diskStorage({
        destination: './uploads/products',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);

          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  updateEquipmentImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this._equipmentService.updateEquipmentImage(id, file);
  }
  @Delete('file/:id')
  deleteFile(@Param('id') id: string) {
    return this._equipmentService.deleteEquipmentImage(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this._equipmentService.remove(id);
  }
}
