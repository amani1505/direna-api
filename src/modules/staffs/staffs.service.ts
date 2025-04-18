import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { getMetadataArgsStorage, In, Repository } from 'typeorm';
import { User } from '@modules/user/entities/user.entity';
import { Branch } from '@modules/branches/entities/branch.entity';
import { Role } from '@modules/roles/entities/role.entity';
import { UserService } from '@modules/user/user.service';
import { PaginationOptions } from '@interface/pagination-option.interface';
import { PaginationInterface } from '@interface/pagination.interface';
import { applyFiltersAndPagination } from '@utils/filter';
import { GenerateUniqueNumberUtil } from '@utils/generate-unique-number.util';

@Injectable()
export class StaffsService {
  constructor(
    @InjectRepository(Staff)
    private _staffRepository: Repository<Staff>,

    @InjectRepository(User)
    private _userRepository: Repository<User>,

    @InjectRepository(Branch)
    private _branchRepository: Repository<Branch>,

    @InjectRepository(Role)
    private _roleRepository: Repository<Role>,

    private _userService: UserService,
    private readonly _generateUniqueNumberUtil: GenerateUniqueNumberUtil,
  ) {}

  async create(createStaffDto: CreateStaffDto): Promise<Staff> {
    try {
      const { branchId, role, ...staffData } = createStaffDto;

      const email = await this._staffRepository.findOne({
        where: { email: createStaffDto.email },
      });

      const branch = await this._branchRepository.findOne({
        where: { id: branchId },
      });

      const staffRole = await this._roleRepository.findOne({
        where: { id: role },
      });

      if (email) {
        throw new HttpException(
          `The staff with this email: ${createStaffDto.email} have already exist!`,
          HttpStatus.CONFLICT,
        );
      }

      if (!branch) {
        throw new NotFoundException(`branch not found`);
      }
      if (!staffRole) {
        throw new NotFoundException(`role not found`);
      }

      const staffNumber =
        await this._generateUniqueNumberUtil.generateUniqueNumber(
          'DIRENA-STF',
          this._staffRepository,
          'staff_number',
        );

      const createdStaff = this._staffRepository.create({
        ...staffData,
        staff_number: staffNumber,

        branch,
      });

      const staffCreated = await this._staffRepository.save(createdStaff);
      await this._userService.create(
        {
          first_name: createStaffDto.first_name,
          middle_name: createStaffDto.middle_name,
          last_name: createStaffDto.last_name,
          phone_number: createStaffDto.phone,
          gender: createStaffDto.gender,
          email: createStaffDto.email,
          roleId: role,
          staffId: staffCreated.id,
        },
        'staff',
      );
      return staffCreated;
    } catch (error) {
      throw new HttpException(
        `Failed to create!:${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(
    query: PaginationOptions,
  ): Promise<PaginationInterface<Staff> | Staff[]> {
    try {
      const {
        relations = [],
        sortBy = 'first_name',
        sortOrder = 'ASC',
      } = query;

      const queryBuilder = this._staffRepository.createQueryBuilder('staff');

      const validRelations = getMetadataArgsStorage()
        .relations.filter((relation) => relation.target === Staff)
        .map((relation) => relation.propertyName);

      relations.forEach((relation: string) => {
        if (!validRelations.includes(relation)) {
          throw new HttpException(
            `Invalid relation: ${relation}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        queryBuilder.leftJoinAndSelect(`staff.${relation}`, relation);
      });

      return applyFiltersAndPagination(
        queryBuilder,
        { ...query, sortBy, sortOrder },
        validRelations,
        'staff',
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async findAllTrainers(): Promise<Staff[]> {
    try {
      const trainers = await this._userRepository.find({
        where: {
          role: {
            name: 'Trainer',
          },
        },
      });

      const trainerEmails = trainers.map((trainer) => trainer.email);

      if (trainerEmails.length === 0) {
        return [];
      }

      // Step 3: Fetch staffs whose emails match the trainers' emails
      return await this._staffRepository.find({
        where: {
          email: In(trainerEmails), // Use the "In" operator to match multiple emails
        },
      });
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve staffs with trainer emails: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string, query: any): Promise<any> {
    const { relations = [] } = query; // Extract relations from the query

    if (!Array.isArray(relations)) {
      throw new HttpException(
        'Invalid input: relations must be an array',
        HttpStatus.BAD_REQUEST,
      );
    }

    const validRelations = getMetadataArgsStorage()
      .relations.filter((relation) => relation.target === Staff)
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
      const staff = await this._staffRepository.findOne({
        where: { id },
        relations,
      });

      const user = await this._userRepository.findOne({
        where: {
          email: staff.email,
        },
        relations: ['role'],
      });

      if (!staff) {
        throw new NotFoundException(`Staff not found`);
      }

      return { ...staff, role: user.role };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async update(id: string, updateStaffDto: UpdateStaffDto): Promise<Staff> {
    try {
      const staff = await this._staffRepository.findOne({
        where: { id },
      });
      const branch = await this._branchRepository.findOne({
        where: { id: updateStaffDto.branchId },
      });

      const user = await this._userRepository.findOne({
        where: { email: staff.email },
      });

      if (!staff) {
        throw new NotFoundException(`staff not found`);
      }
      if (!user) {
        throw new NotFoundException(`user not found`);
      }

      if (!branch) {
        throw new NotFoundException(`branch not found`);
      }

      if (updateStaffDto.email) {
        user.email = updateStaffDto.email;
      }
      if (updateStaffDto.role) {
        user.roleId = updateStaffDto.role;
      }

      staff.branch = branch;

      this._staffRepository.merge(staff, updateStaffDto);

      await this._userRepository.save(user);

      await this._staffRepository.save(staff);
      return staff;
    } catch (error) {
      throw new Error(`Failed to update staff: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const staff = await this._staffRepository.findOne({
        where: { id },
      });

      if (!staff) {
        throw new NotFoundException(`Staff not found`);
      }

      // Find associated user
      const user = await this._userRepository.findOne({
        where: { email: staff.email },
      });

      // If user exists, remove it first (due to foreign key constraints)
      if (user) {
        await this._userRepository.delete(user.id); // Using delete instead of remove
      }

      // Remove the staff
      await this._staffRepository.delete(staff.id); // Using delete instead of remove

      return {
        message: `Successfully deleted the staff: ${staff.last_name}`,
        status: 'success',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException to maintain the correct status code
      }

      throw new HttpException(
        {
          message: 'Failed to delete the staff',
          error: error.message || 'Internal Server Error',
          status: 'error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
