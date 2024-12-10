import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Branch } from './entities/branch.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, getMetadataArgsStorage } from 'typeorm';
import { PaginationInterface } from 'src/interfaces/pagination.interface';
import { applyFiltersAndPagination } from '@utils/filter';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private _branchRepository: Repository<Branch>,
  ) {}

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    try {
      const branch = await this._branchRepository.findOne({
        where: { house_no: createBranchDto.house_no },
      });

      if (branch) {
        throw new NotFoundException(`The branch house no is  already exist`);
      }

      const createdBranch = this._branchRepository.create(createBranchDto);
      const branchCreated = await this._branchRepository.save(createdBranch);

      return branchCreated;
    } catch (error) {
      throw new HttpException(
        `Failed to create!:${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(query: any): Promise<PaginationInterface<Branch> | Branch[]> {
    try {
      const { relations = [] } = query;

      const queryBuilder = this._branchRepository.createQueryBuilder('branch');

      // Validate relations
      const validRelations = getMetadataArgsStorage()
        .relations.filter((relation) => relation.target === Branch)
        .map((relation) => relation.propertyName);

      relations.forEach((relation: string) => {
        if (!validRelations.includes(relation)) {
          throw new HttpException(
            `Invalid relation: ${relation}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        queryBuilder.leftJoinAndSelect(`branch.${relation}`, relation);
      });

      return applyFiltersAndPagination(
        queryBuilder,
        query,
        validRelations,
        'branch',
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} branch`;
  }

  update(id: number, updateBranchDto: UpdateBranchDto) {
    return `This action updates a #${id} branch`;
  }

  remove(id: number) {
    return `This action removes a #${id} branch`;
  }
}
