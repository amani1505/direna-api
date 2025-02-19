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
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { PaginationOptions } from '@interface/pagination-option.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Filename } from '@utils/filename';
import { checkFileExtension } from '@utils/fileCheckExtention';

@Controller('classes')
export class ClassesController {
  constructor(private readonly _classesService: ClassesService) {}

  @UseInterceptors(
    FileInterceptor('class', {
      storage: diskStorage({
        destination: './uploads/classes',
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
    @Body() createClassDto: CreateClassDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (createClassDto !== null) {
      createClassDto.image = file.path;
    }

    return this._classesService.create(createClassDto);
  }

  @Get()
  findAll(@Query() query: PaginationOptions) {
    return this._classesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: any) {
    return this._classesService.findOne(id, query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClassDto: UpdateClassDto) {
    return this._classesService.update(id, updateClassDto);
  }

  @Patch('file/:id')
  @UseInterceptors(
    FileInterceptor('class', {
      storage: diskStorage({
        destination: './uploads/classes',
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
    return this._classesService.updateClassFile(id, file);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this._classesService.remove(id);
  }
}
