import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Delete,
  // UseGuards,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { PaginationOptions } from '@interface/pagination-option.interface';
import { UpdateMemberDto } from './dto/update-member.dto';
// import { RolesGuard } from '@modules/auth/guard/role.guard';
// import { Roles } from '@modules/auth/decorators/role.decorator';
// import { JwtAuthGuard } from '@modules/auth/guard/jwt-auth.guard';

@Controller('member')
export class MemberController {
  constructor(private readonly _memberService: MemberService) {}

  @Post()
  create(@Body() createMemberDto: CreateMemberDto) {
    return this._memberService.create(createMemberDto);
  }

  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles('Super Admin')
  @Get()
  findAll(@Query() query: PaginationOptions) {
    return this._memberService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Query() query: any) {
    return this._memberService.findOne(id, query);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMemberDto: UpdateMemberDto) {
    return this._memberService.update(id, updateMemberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this._memberService.remove(id);
  }
}
