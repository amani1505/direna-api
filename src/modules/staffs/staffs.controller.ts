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
import { StaffsService } from './staffs.service';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { PaginationOptions } from '@interface/pagination-option.interface';

@Controller('staffs')
export class StaffsController {
  constructor(private readonly _staffsService: StaffsService) {}

  @Post()
  create(@Body() createStaffDto: CreateStaffDto) {
    return this._staffsService.create(createStaffDto);
  }

  @Get()
  findAll(@Query() query: PaginationOptions) {
    return this._staffsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: any) {
    return this._staffsService.findOne(id, query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStaffDto: UpdateStaffDto) {
    return this._staffsService.update(id, updateStaffDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this._staffsService.remove(id);
  }
}
