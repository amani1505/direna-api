import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { WishlistService } from './wishlist.service';
import { CreateWishlistDto } from './dto/create-wishlist.dto';
// import { UpdateWishlistDto } from './dto/update-wishlist.dto';
import { JwtAuthGuard } from '@modules/auth/guard/jwt-auth.guard';
import { SessionGuard } from '@modules/auth/guard/session.guard';

@Controller('wishlist')
export class WishlistController {
  constructor(private readonly _wishlistService: WishlistService) {}

  @UseGuards(JwtAuthGuard, SessionGuard)
  @Post()
  create(@Body() createWishlistDto: CreateWishlistDto, @Request() req) {
    return this._wishlistService.create(createWishlistDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this._wishlistService.findAll();
  }

  @UseGuards(JwtAuthGuard, SessionGuard)
  @Get('mine')
  findAllMyWishlist(@Request() req) {
    return this._wishlistService.findAllMyWishlist(req.user.id);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.wishlistService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateWishlistDto: UpdateWishlistDto,
  // ) {
  //   return this.wishlistService.update(+id, updateWishlistDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this._wishlistService.remove(id);
  }
}
