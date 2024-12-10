import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';
import { getMetadataArgsStorage, Repository } from 'typeorm';
import { PaginationInterface } from '@interface/pagination.interface';
import { applyFiltersAndPagination } from '@utils/filter';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private _serviceRepository: Repository<Service>,
  ) {}

  async create(createServiceDto: CreateServiceDto): Promise<Service> {
    try {
      const service = await this._serviceRepository.findOne({
        where: { name: createServiceDto.name },
      });

      if (service) {
        throw new NotFoundException(`The Service is  already exist`);
      }

      const createdService = this._serviceRepository.create(createServiceDto);
      const serviceCreated = await this._serviceRepository.save(createdService);

      return serviceCreated;
    } catch (error) {
      throw new HttpException(
        `Failed to create!:${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(query: any): Promise<PaginationInterface<Service> | Service[]> {
    try {
      const { relations = [], sortBy = 'name', sortOrder = 'ASC' } = query;

      const queryBuilder =
        this._serviceRepository.createQueryBuilder('service');

      const validRelations = getMetadataArgsStorage()
        .relations.filter((relation) => relation.target === Service)
        .map((relation) => relation.propertyName);

      relations.forEach((relation: string) => {
        if (!validRelations.includes(relation)) {
          throw new HttpException(
            `Invalid relation: ${relation}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        queryBuilder.leftJoinAndSelect(`service.${relation}`, relation);
      });

      // Ensure sortBy and sortOrder are passed
      return applyFiltersAndPagination(
        queryBuilder,
        { ...query, sortBy, sortOrder }, // Merge query with defaults
        validRelations,
        'service',
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async findOne(id: string, query: any): Promise<Service> {
    const { relations = [] } = query; // Extract relations from the query

    if (!Array.isArray(relations)) {
      throw new HttpException(
        'Invalid input: relations must be an array',
        HttpStatus.BAD_REQUEST,
      );
    }

    const validRelations = getMetadataArgsStorage()
      .relations.filter((relation) => relation.target === Service)
      .map((relation) => relation.propertyName);

    relations.forEach((relation: string) => {
      if (!validRelations.includes(relation)) {
        throw new HttpException(
          `Invalid relation: ${relation}`,
          HttpStatus.BAD_REQUEST,
        );
      }
    });

    try {
      const service = await this._serviceRepository.findOne({
        where: { id },
        relations,
      });

      if (!service) {
        throw new NotFoundException(`Service not found`);
      }

      return service;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<Service> {
    try {
      const service = await this._serviceRepository.findOne({
        where: { id },
      });

      if (!service) {
        throw new NotFoundException(`service not found`);
      }
      this._serviceRepository.merge(service, updateServiceDto);
      await this._serviceRepository.save(service);
      return await this._serviceRepository.findOne({ where: { id } });
    } catch (error) {
      throw new Error(`Failed to update the service: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const services = await this._serviceRepository.find();
      const service = await this._serviceRepository.findOne({
        where: { id },
      });

      if (!service) {
        throw new NotFoundException('Service not found');
      }
      if (services.length > 1) {
        await this._serviceRepository.remove(service);

        return {
          message: `Successfully delete the service: ${service.name}`,
          status: 'success',
        };
      }
      throw new HttpException(
        {
          message: 'The organization must have atleast one service',
          error: 'Internal Server Error',
          status: 'error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to delete the service',
          error: error.message || 'Internal Server Error',
          status: 'error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
