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
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { PaginationOptions } from '@interface/pagination-option.interface';

@Controller('roles')
export class RolesController {
  constructor(private readonly _rolesService: RolesService) {}

  @Post()
  create(@Body() createRoleDto: CreateRoleDto) {
    return this._rolesService.create(createRoleDto);
  }

  @Get()
  findAll(@Query() query: PaginationOptions) {
    return this._rolesService.findAll(query);
  }
  @Get('except-user')
  findAllExceptUser() {
    return this._rolesService.findAllExceptUser();
  }
  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: any) {
    return this._rolesService.findOne(id, query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this._rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this._rolesService.remove(id);
  }
}
