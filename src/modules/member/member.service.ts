import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { getMetadataArgsStorage, In, Repository } from 'typeorm';
import { UserService } from '@modules/user/user.service';
import { PaginationInterface } from '@interface/pagination.interface';
import { applyFiltersAndPagination } from '@utils/filter';
import { PaginationOptions } from '@interface/pagination-option.interface';
import { User } from '@modules/user/entities/user.entity';
import { Branch } from '@modules/branches/entities/branch.entity';
import { Service } from '@modules/services/entities/service.entity';
import { Role } from '@modules/roles/entities/role.entity';
import { GenerateUniqueNumberUtil } from '@utils/generate-unique-number.util';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private _memberRepository: Repository<Member>,
    @InjectRepository(User)
    private _userRepository: Repository<User>,
    @InjectRepository(Branch)
    private _branchRepository: Repository<Branch>,

    @InjectRepository(Service)
    private _serviceRepository: Repository<Service>,

    @InjectRepository(Role)
    private _roleRepository: Repository<Role>,

    private _userService: UserService,
    private readonly _generateUniqueNumberUtil: GenerateUniqueNumberUtil,
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    try {
      const { serviceIds, branchId, ...memberData } = createMemberDto;

      const email = await this._memberRepository.findOne({
        where: { email: createMemberDto.email },
      });

      const branch = await this._branchRepository.findOne({
        where: { id: branchId },
      });

      const role = await this._roleRepository.findOne({
        where: { name: 'Member' },
      });

      if (email) {
        throw new NotFoundException(`The Email is  already exist`);
      }

      if (!branch) {
        throw new NotFoundException(`branch not found`);
      }

      // const services = await this._serviceRepository.findByIds(serviceIds);

      const services = await this._serviceRepository.find({
        where: {
          id: In(serviceIds), // Import In from typeorm
        },
      });

      if (services.length !== serviceIds.length) {
        throw new NotFoundException(`One or more services not found`);
      }

      const memberNumber =
        await this._generateUniqueNumberUtil.generateUniqueNumber(
          'DIRENA-MEM',
          this._memberRepository,
          'member_number',
        );

      const createdMember = this._memberRepository.create({
        ...memberData,
        member_number: memberNumber,
        branch,
        services, // Assign services directly
      });

      const memberCreated = await this._memberRepository.save(createdMember);

      await this._userService.create(
        {
          first_name: createMemberDto.first_name,
          middle_name: createMemberDto.middle_name,
          last_name: createMemberDto.last_name,
          phone_number: createMemberDto.phone,
          gender: createMemberDto.gender,
          email: createMemberDto.email,
          roleId: role.id,
          memberId: memberCreated.id,
        },
        'member',
      );

      return memberCreated;
    } catch (error) {
      throw new HttpException(
        `Failed to create!:${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async becomeAMember(createMemberDto: CreateMemberDto): Promise<Member> {
    try {
      const { serviceIds, branchId, ...memberData } = createMemberDto;

      const member = await this._memberRepository.findOne({
        where: { email: createMemberDto.email },
      });

      const branch = await this._branchRepository.findOne({
        where: { id: branchId },
      });

      if (member) {
        throw new HttpException('User already a member', HttpStatus.CONFLICT);
      }

      if (!branch) {
        throw new NotFoundException(`branch not found`);
      }

      const services = await this._serviceRepository.find({
        where: {
          id: In(serviceIds), // Import In from typeorm
        },
      });

      if (services.length !== serviceIds.length) {
        throw new NotFoundException(`One or more services not found`);
      }

      const memberNumber =
        await this._generateUniqueNumberUtil.generateUniqueNumber(
          'DIRENA-MEM',
          this._memberRepository,
          'member_number',
        );

      const createdMember = this._memberRepository.create({
        ...memberData,
        member_number: memberNumber,
        branch,
        services,
      });

      const memberCreated = await this._memberRepository.save(createdMember);

      return memberCreated;
    } catch (error) {
      throw new HttpException(
        `Failed to create!:${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(
    query: PaginationOptions,
  ): Promise<PaginationInterface<Member> | Member[]> {
    try {
      const {
        relations = [],
        sortBy = 'first_name',
        sortOrder = 'ASC',
      } = query;

      const queryBuilder = this._memberRepository.createQueryBuilder('member');

      const validRelations = getMetadataArgsStorage()
        .relations.filter((relation) => relation.target === Member)
        .map((relation) => relation.propertyName);

      relations.forEach((relation: string) => {
        if (!validRelations.includes(relation)) {
          throw new HttpException(
            `Invalid relation: ${relation}`,
            HttpStatus.BAD_REQUEST,
          );
        }
        queryBuilder.leftJoinAndSelect(`member.${relation}`, relation);
      });

      return applyFiltersAndPagination(
        queryBuilder,
        { ...query, sortBy, sortOrder },
        validRelations,
        'member',
      );
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async findOne(id: string, query: any): Promise<Member> {
    const { relations = ['user'] } = query; // Extract relations from the query

    if (!Array.isArray(relations)) {
      throw new HttpException(
        'Invalid input: relations must be an array',
        HttpStatus.BAD_REQUEST,
      );
    }

    const validRelations = getMetadataArgsStorage()
      .relations.filter((relation) => relation.target === Member)
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
      const member = await this._memberRepository.findOne({
        where: { id },
        relations,
      });

      if (!member) {
        throw new NotFoundException(`Member not found`);
      }

      return member;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async update(id: string, updateMemberDto: UpdateMemberDto): Promise<Member> {
    try {
      let services: Service[] = [];
      const member = await this._memberRepository.findOne({
        where: { id },
      });
      const branch = await this._branchRepository.findOne({
        where: { id: updateMemberDto.branchId },
      });

      const user = await this._userRepository.findOne({
        where: { email: member.email },
      });

      if (!member) {
        throw new NotFoundException(`member not found`);
      }
      if (!user) {
        throw new NotFoundException(`user not found`);
      }

      if (!branch) {
        throw new NotFoundException(`branch not found`);
      }

      if (updateMemberDto.serviceIds && updateMemberDto.serviceIds.length > 0) {
        services = await this._serviceRepository.find({
          where: { id: In(updateMemberDto.serviceIds) },
        });

        if (services.length !== updateMemberDto.serviceIds.length) {
          throw new NotFoundException(`One or more services not found`);
        }
      }

      if (updateMemberDto.email) {
        user.email = updateMemberDto.email;
      }

      if (updateMemberDto.branchId) {
        member.branch = branch;
      }
      if (updateMemberDto.serviceIds) {
        member.services = services;
      }

      this._memberRepository.merge(member, updateMemberDto);

      await this._userRepository.save(user);

      await this._memberRepository.save(member);
      return member;
    } catch (error) {
      throw new Error(`Failed to update member: ${error.message}`);
    }
  }

  async remove(id: string) {
    try {
      const member = await this._memberRepository.findOne({
        where: { id },
      });

      if (!member) {
        throw new NotFoundException(`Member not found`);
      }

      // Find associated user
      const user = await this._userRepository.findOne({
        where: { email: member.email },
      });

      // If user exists, remove it first (due to foreign key constraints)
      if (user) {
        await this._userRepository.delete(user.id); // Using delete instead of remove
      }

      // Remove the member
      await this._memberRepository.delete(member.id); // Using delete instead of remove

      return {
        message: `Successfully deleted the member: ${member.last_name}`,
        status: 'success',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Re-throw NotFoundException to maintain the correct status code
      }

      throw new HttpException(
        {
          message: 'Failed to delete the member',
          error: error.message || 'Internal Server Error',
          status: 'error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
