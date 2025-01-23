import { Module } from '@nestjs/common';
import { FileService } from './file.service';
import { FileController } from './file.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Files } from './entities/file.entity';
import { Equipment } from '@modules/equipment/entities/equipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Files, Equipment])],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
