import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Files } from './entities/file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Files])],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
