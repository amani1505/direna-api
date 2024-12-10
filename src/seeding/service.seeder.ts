import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import { Service } from '@modules/services/entities/service.entity';

@Injectable()
export class ServiceSeeder {
  constructor(
    @InjectRepository(Service)
    private readonly _serviceRepository: Repository<Service>,
  ) {}

  async seed() {
    const services = JSON.parse(
      fs.readFileSync('src/assets/service.json', 'utf8'),
    );

    for (const service of services) {
      const existingService = await this._serviceRepository.findOne({
        where: { name: service.name },
      });

      if (!existingService) {
        const direnaService = new Service();
        direnaService.name = service.name;
        direnaService.description = service.description;

        await this._serviceRepository.save(direnaService);
      } else {
        existingService.name = service.name;
        existingService.description = service.description;
        await this._serviceRepository.save(existingService);
      }
    }
  }
}
