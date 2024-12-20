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
import { RoleEnum } from '@enum/role.enum';
import { PaginationInterface } from '@interface/pagination.interface';
import { applyFiltersAndPagination } from '@utils/filter';
import { PaginationOptions } from '@interface/pagination-option.interface';
import { User } from '@modules/user/entities/user.entity';
import { Branch } from '@modules/branches/entities/branch.entity';
import { Service } from '@modules/services/entities/service.entity';

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

    private _userService: UserService,
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

      const createdMember = this._memberRepository.create({
        ...memberData,
        branch,
        services, // Assign services directly
      });

      await this._userService.create({
        fullname: createdMember.fullname,
        email: createMemberDto.email,
        role: RoleEnum.USER,
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
      const { relations = [], sortBy = 'fullname', sortOrder = 'ASC' } = query;

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
    const { relations = [] } = query; // Extract relations from the query

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

      console.log('Update DTO', updateMemberDto);
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

      member.branch = branch;
      member.services = services;

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
      const user = await this._userRepository.findOne({
        where: { email: member.email },
      });

      if (!member) {
        throw new NotFoundException(`Member not found  ${member.fullname}`);
      }

      if (user) {
       await this._userRepository.remove(user);
        await this._memberRepository.remove(member);
      }

    
      await this._memberRepository.remove(member);

      return {
        message: `Successfully delete the member: ${member.fullname}`,
        status: 'success',
      };
    } catch (error) {
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
