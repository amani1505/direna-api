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
import { getMetadataArgsStorage, Repository } from 'typeorm';
import { UserService } from '@modules/user/user.service';
import { RoleEnum } from '@enum/role.enum';
import { PaginationInterface } from '@interface/pagination.interface';
import { applyFiltersAndPagination } from '@utils/filter';
import { PaginationOptions } from '@interface/pagination-option.interface';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private _memberRepository: Repository<Member>,
    private _userService: UserService,
  ) {}

  async create(createMemberDto: CreateMemberDto): Promise<Member> {
    try {
      const username = await this._memberRepository.findOne({
        where: { username: createMemberDto.username },
      });
      const email = await this._memberRepository.findOne({
        where: { email: createMemberDto.email },
      });

      if (username) {
        throw new NotFoundException(`The Username is  already exist`);
      }
      if (email) {
        throw new NotFoundException(`The Email is  already exist`);
      }

      const createdMember = this._memberRepository.create(createMemberDto);

      await this._userService.create({
        email: createMemberDto.email,
        username: createMemberDto.username,
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
      const member = await this._memberRepository.findOne({
        where: { id },
      });

      if (!member) {
        throw new NotFoundException(`member not found`);
      }
      this._memberRepository.merge(member, updateMemberDto);
      await this._memberRepository.save(member);
      return await this._memberRepository.findOne({ where: { id } });
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
        throw new NotFoundException('Member not found');
      }

      await this._memberRepository.remove(member);

      return {
        message: `Successfully delete the member: ${member.username}`,
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
