import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { checkFileExtension } from '@utils/fileCheckExtention';
import { Filename } from '@utils/filename';
import { diskStorage } from 'multer';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaginationOptions } from '@interface/pagination-option.interface';

@Controller('blogs')
export class BlogController {
  constructor(private readonly _blogService: BlogService) {}

  @UseInterceptors(
    FileInterceptor('blog', {
      storage: diskStorage({
        destination: './uploads/blogs',
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
  async create(
    @Body() createBlogDto: CreateBlogDto,
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (createBlogDto !== null) {
      createBlogDto.image = file.path;
    }
    return this._blogService.create(createBlogDto);
  }

  @Get()
  findAll(@Query() query: PaginationOptions) {
    return this._blogService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: any) {
    return this._blogService.findOne(id, query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBlogDto: UpdateBlogDto) {
    return this._blogService.update(id, updateBlogDto);
  }

  @Patch('file/:id')
  @UseInterceptors(
    FileInterceptor('blog', {
      storage: diskStorage({
        destination: './uploads/blogs',
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
    return this._blogService.updateBlogFile(id, file);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this._blogService.remove(id);
  }
}
