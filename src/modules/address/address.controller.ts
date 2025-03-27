import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '@modules/auth/guard/jwt-auth.guard';
import { SessionGuard } from '@modules/auth/guard/session.guard';

@UseGuards(JwtAuthGuard, SessionGuard)
@Controller('address')
export class AddressController {
  constructor(private readonly _addressService: AddressService) {}

  @Post()
  create(@Request() req, @Body() createAddressDto: CreateAddressDto) {
    return this._addressService.create(createAddressDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    console.log(req.user);
    return this._addressService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this._addressService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAddressDto: UpdateAddressDto,
    @Request() req,
  ) {
    return this._addressService.update(id, updateAddressDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this._addressService.remove(id, req.user.id);
  }
}
