import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { RoleModulesService } from './role-modules.service';
import { CreateRoleModuleDto } from './dto/create-role-module.dto';
import { UpdateRoleModuleDto } from './dto/update-role-module.dto';

@Controller('role-modules')
export class RoleModulesController {
  constructor(private readonly _roleModulesService: RoleModulesService) {}

  @Post()
  async create(@Body() createRoleModuleDto: CreateRoleModuleDto) {
    try {
      const roleModule =
        await this._roleModulesService.create(createRoleModuleDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'RoleModule created successfully',
        data: roleModule,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            message: error.message,
          },
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      const roleModules = await this._roleModulesService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Role Modules fetched successfully',
        data: roleModules,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const roleModule = await this._roleModulesService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Role Module fetched successfully',
        data: roleModule,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateRoleModuleDto: UpdateRoleModuleDto,
  ) {
    try {
      const roleModule = await this._roleModulesService.update(
        id,
        updateRoleModuleDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Role Module updated successfully',
        data: roleModule,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      await this._roleModulesService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Role Module deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
