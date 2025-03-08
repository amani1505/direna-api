import {
  Controller,
  // Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
  Delete,
  UseGuards,
  Get,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '@modules/auth/guard/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(private readonly _userService: UserService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this._userService.create(createUserDto);
  }
  @Post('avatar/:id')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);

          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  uploadProductFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this._userService.uploadUserAvatar(id, file);
  }

  @Patch('avatar/:id')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);

          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  updateFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this._userService.updateUserAvatar(id, file);
  }

  @UseGuards(JwtAuthGuard)
  // @Roles('Super Admin')
  @Get('me')
  findOne(@Request() req) {
    const userId = req.session.userId;
    return this._userService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this._userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body() userType: string) {
    return this._userService.remove(id, userType);
  }
}
