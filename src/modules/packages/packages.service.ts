import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Package } from './entities/package.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private _packageRepository: Repository<Package>,
  ) {}

  async create(createPackageDto: CreatePackageDto): Promise<Package> {
    try {
      // Check if a package with the same name already exists
      const existingPackage = await this._packageRepository.findOne({
        where: { name: createPackageDto.name },
      });
      if (existingPackage) {
        throw new BadRequestException(
          `The package with name '${createPackageDto.name}' already exists`,
        );
      }

      // If unlimited, set maxSessions to 0
      // if (createGymPackageDto.isUnlimited) {
      //   createGymPackageDto.maxSessions = 0;
      // }

      const newGymPackage = this._packageRepository.create(createPackageDto);

      return await this._packageRepository.save(newGymPackage);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to create  package: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<Package[]> {
    try {
      return await this._packageRepository.find();
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve packages: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<Package> {
    try {
      const gymPackage = await this._packageRepository.findOne({
        where: { id },
        relations: ['members'],
      });
      if (!gymPackage) {
        throw new NotFoundException(`Package with ID ${id} not found`);
      }
      return gymPackage;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to retrieve Package: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updatePackageDto: UpdatePackageDto,
  ): Promise<Package> {
    try {
      const gymPackage = await this._packageRepository.findOne({
        where: { id },
      });
      if (!gymPackage) {
        throw new NotFoundException(`Package with ID ${id} not found`);
      }

      // If name is being updated, check for duplicates
      if (updatePackageDto.name && updatePackageDto.name !== gymPackage.name) {
        const existingPackage = await this._packageRepository.findOne({
          where: { name: updatePackageDto.name },
        });
        if (existingPackage && existingPackage.id !== id) {
          throw new BadRequestException(
            `The package with name '${updatePackageDto.name}' already exists`,
          );
        }
      }

      // If unlimited flag is updated, adjust maxSessions
      // if (updateGymPackageDto.isUnlimited !== undefined) {
      //   if (updateGymPackageDto.isUnlimited) {
      //     updateGymPackageDto.maxSessions = 0;
      //   }
      //   // Only set a default if switching from unlimited to limited and no maxSessions provided
      //   else if (
      //     gymPackage.isUnlimited &&
      //     updateGymPackageDto.maxSessions === undefined
      //   ) {
      //     updateGymPackageDto.maxSessions = 10; // Default value when switching from unlimited
      //   }
      // }
      this._packageRepository.merge(gymPackage, updatePackageDto);
      return await this._packageRepository.save(gymPackage);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to update package: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const gymPackage = await this._packageRepository.findOne({
        where: { id },
      });
      if (!gymPackage) {
        throw new NotFoundException(`Package with ID ${id} not found`);
      }

      await this._packageRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        `Failed to delete package: ${error.message}`,
      );
    }
  }
}
