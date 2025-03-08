import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { RoleActionsService } from './role-actions.service';
import { CreateRoleActionDto } from './dto/create-role-action.dto';
import { UpdateRoleActionDto } from './dto/update-role-action.dto';

@Controller('role-actions')
export class RoleActionsController {
  constructor(private readonly _roleActionsService: RoleActionsService) {}

  @Post()
  async create(@Body() createRoleActionDto: CreateRoleActionDto) {
    try {
      const roleAction =
        await this._roleActionsService.create(createRoleActionDto);
      return {
        statusCode: HttpStatus.CREATED,
        message: 'RoleAction created successfully',
        data: roleAction,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get()
  async findAll() {
    try {
      const roleActions = await this._roleActionsService.findAll();
      return {
        statusCode: HttpStatus.OK,
        message: 'Role Actions fetched successfully',
        data: roleActions,
      };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const roleAction = await this._roleActionsService.findOne(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Role Action fetched successfully',
        data: roleAction,
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
    @Body() updateRoleActionDto: UpdateRoleActionDto,
  ) {
    try {
      const roleAction = await this._roleActionsService.update(
        id,
        updateRoleActionDto,
      );
      return {
        statusCode: HttpStatus.OK,
        message: 'Role Action updated successfully',
        data: roleAction,
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
      await this._roleActionsService.remove(id);
      return {
        statusCode: HttpStatus.OK,
        message: 'Role Action deleted successfully',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
