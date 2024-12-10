import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMemberDto } from './dto/create-member.dto';
// import { UpdateMemberDto } from './dto/update-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Member } from './entities/member.entity';
import { Repository } from 'typeorm';
import { UserService } from '@modules/user/user.service';
import { RoleEnum } from '@enum/role.enum';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(Member)
    private _memberRepository: Repository<Member>,
    private _userService: UserService,
  ) {}

  async create(createMemberDto: CreateMemberDto) {
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

  // findAll() {
  //   return `This action returns all member`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} member`;
  // }

  // update(id: number, updateMemberDto: UpdateMemberDto) {
  //   return `This action updates a #${id} member`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} member`;
  // }
}
