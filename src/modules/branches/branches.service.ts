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
import { applyFiltersAndPagination } from '@utils/filter';
import { PaginationInterface } from '@interface/pagination.interface';

@Injectable()
export class BranchesService {
  constructor(
    @InjectRepository(Branch)
    private _branchRepository: Repository<Branch>,
  ) {}

  /**
   * Creates a new branch.
   * @param createBranchDto - Data Transfer Object containing the details of the branch to create.
   * @returns The newly created branch.
   * @throws {HttpException} If a branch with the same house number already exists or if an error occurs during creation.
   */
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

  /**
   * Retrieves all branches with optional filtering and pagination.
   * @param query - Query parameters for filtering, sorting, pagination, and relations.
   * @returns A list of branches or paginated branches based on the query.
   * @throws {HttpException} If an error occurs during the retrieval process.
   */
  async findAll(query: any): Promise<PaginationInterface<Branch> | Branch[]> {
    try {
      const { relations = [], sortBy = 'city', sortOrder = 'DESC' } = query;

      const queryBuilder = this._branchRepository.createQueryBuilder('branch');

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
        { ...query, sortBy, sortOrder },
        validRelations,
        'branch',
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Retrieves a single branch by its ID, with optional relations.
   * @param id - The ID of the branch to retrieve.
   * @param query - Query parameters for relations.
   * @returns The branch with the specified ID.
   * @throws {HttpException} If the branch is not found or an invalid relation is specified.
   */
  async findOne(id: string, query: any): Promise<Branch> {
    const { relations = [] } = query; // Extract relations from the query

    if (!Array.isArray(relations)) {
      throw new HttpException(
        'Invalid input: relations must be an array',
        HttpStatus.BAD_REQUEST,
      );
    }

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
    });

    try {
      const branch = await this._branchRepository.findOne({
        where: { id },
        relations,
      });

      if (!branch) {
        throw new NotFoundException(`Branch not found`);
      }

      return branch;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  /**
   * Updates a branch with new details.
   * @param id - The ID of the branch to update.
   * @param updateBranchDto - Data Transfer Object containing the updated branch details.
   * @returns The updated branch.
   * @throws {HttpException} If the branch is not found or an error occurs during update.
   */
  async update(id: string, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    try {
      const branch = await this._branchRepository.findOne({
        where: { id },
      });

      if (!branch) {
        throw new NotFoundException(`branch not found`);
      }
      this._branchRepository.merge(branch, updateBranchDto);
      await this._branchRepository.save(branch);
      return await this._branchRepository.findOne({ where: { id } });
    } catch (error) {
      throw new Error(`Failed to update branch: ${error.message}`);
    }
  }

  /**
   * Deletes a branch by its ID.
   * Ensures that at least one branch remains in the organization.
   * @param id - The ID of the branch to delete.
   * @returns A success message upon successful deletion.
   * @throws {HttpException} If there are insufficient branches or an error occurs during deletion.
   */
  async remove(id: string) {
    try {
      const branches = await this._branchRepository.find();
      const branch = await this._branchRepository.findOne({
        where: { id },
      });

      if (!branch) {
        throw new NotFoundException('Branch not found');
      }
      if (branches.length > 1) {
        await this._branchRepository.remove(branch);

        return {
          message: `Successfully delete the branch at: ${branch.street}`,
          status: 'success',
        };
      }
      throw new HttpException(
        {
          message: 'The organization must have atleast one branch',
          error: 'Internal Server Error',
          status: 'error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to delete the Branch',
          error: error.message || 'Internal Server Error',
          status: 'error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
