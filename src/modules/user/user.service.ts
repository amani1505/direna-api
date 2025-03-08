import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { MailService } from '@modules/mail/mail.service';
import { readFileSync, unlinkSync, writeFileSync } from 'fs';
import { Member } from '@modules/member/entities/member.entity';
import { Staff } from '@modules/staffs/entities/staff.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private _userRepository: Repository<User>,
    @InjectRepository(Member)
    private _memberRepository: Repository<Member>,

    @InjectRepository(Staff)
    private _staffRepository: Repository<Staff>,

    private _mailService: MailService,
  ) {}
  async create(createUserDto: CreateUserDto, type?: string) {
    try {
      const existingUser = await this._userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new HttpException(
          `The user with this email: ${createUserDto.email} have already exist!`,
          HttpStatus.CONFLICT,
        );
      }

      const { fullname, roleId, ...createUserData } = createUserDto;
      const username = await this.generateUniqueUsername();
      const autoGeneratedPassword = randomBytes(8).toString('hex');
      const hashedPassword = await bcrypt.hash(autoGeneratedPassword, 10);

      const createdUser = this._userRepository.create({
        username,
        ...createUserData,
        roleId,
      });
      createdUser.password = hashedPassword;
      if (type === 'member') {
        const member = await this._memberRepository.findOne({
          where: { id: createUserDto.memberId },
        });

        if (!member) {
          throw new NotFoundException(`Member not found!`);
        }

        createdUser.memberId = member.id; // Assign memberId to the User entity
      } else if (type === 'staff') {
        const staff = await this._staffRepository.findOne({
          where: { id: createUserDto.staffId },
        });

        if (!staff) {
          throw new NotFoundException(`Staff with found!`);
        }

        createdUser.staffId = staff.id; // Assign staffId to the User entity
      } else {
        throw new HttpException(
          `Invalid user type: ${type}. Must be either 'member' or 'staff'.`,
          HttpStatus.BAD_REQUEST,
        );
      }

      await this._mailService.sendMail(
        createUserDto.email, // Assuming username is the email
        'Welcome to Direna Health Support Platform!',
        `Hello ${fullname},\n\nYour account has been created successfully. Here are your credentials:\n\nUsername: ${createUserDto.email}\nPassword: ${autoGeneratedPassword}\n\nPlease change your password after logging in.`,
      );
      await this._userRepository.save(createdUser);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userCreated } = createdUser;
      return userCreated;
    } catch (error) {
      throw new HttpException(`${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async generateUniqueUsername(): Promise<string> {
    let username: string;
    let isUsernameTaken = true;

    while (isUsernameTaken) {
      const randomSuffix = Math.floor(Math.random() * 1000); // 0-999
      username = `user${randomSuffix}`;

      const existingUser = await this._userRepository.findOne({
        where: { username },
      });
      isUsernameTaken = !!existingUser;
    }

    return username;
  }

  // findAll() {
  //   return `This action returns all user`;
  // }

  async findOne(id: string) {
    try {
      const user = await this._userRepository.findOne({
        where: { id },
        relations: ['role'],
      });
      if (!user) {
        throw new NotFoundException(`user not found`);
      }

      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | any> {
    const user = await this._userRepository.findOne({ where: { id } });

    if (updateUserDto.username) {
      const existingUsername = await this._userRepository.findOne({
        where: { username: updateUserDto.username },
      });

      if (existingUsername) {
        throw new HttpException(
          `The username: ${updateUserDto.username} have already exist!`,
          HttpStatus.CONFLICT,
        );
      }
    }

    if (updateUserDto.email) {
      const existingEmail = await this._userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingEmail) {
        throw new HttpException(
          `The email: ${updateUserDto.email} have already exist!`,
          HttpStatus.CONFLICT,
        );
      }
    }

    if (!user) {
      throw new NotFoundException(`user not found`);
    }

    if (updateUserDto.email) {
      user.email = updateUserDto.email;
    }
    if (updateUserDto.username) {
      user.username = updateUserDto.username;
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.username, 10);
    }

    await this._userRepository.save(user);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...updateUserData } = user;

    return updateUserData;
  }

  async uploadUserAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<any> {
    try {
      const user = await this._userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.avatar = file.path;
      await this._userRepository.save(user);

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userData } = user;

      return userData;
    } catch (error) {
      throw new HttpException(
        `Failed to upload avatar: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateUserAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<any> {
    try {
      const user = await this._userRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }
      const oldPath = user.avatar;
      unlinkSync(oldPath);
      const newPath = file.path;
      const fileContent = readFileSync(file.path);

      writeFileSync(newPath, fileContent);

      user.avatar = newPath;
      await this._userRepository.save(user);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userData } = user;

      return userData;
    } catch (error) {
      throw new HttpException(
        `Failed to update avatar: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOneByUsername(username: string): Promise<User> {
    try {
      const user = await this._userRepository.findOne({
        where: { email: username },
      });
      if (!user) {
        throw new NotFoundException(`user not found`);
      }

      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      const user = await this._userRepository.findOne({
        where: { email },
        relations: ['role'],
      });
      if (!user) {
        throw new NotFoundException(`user not found`);
      }

      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.NOT_FOUND);
    }
  }

  async getProfile(userId: string): Promise<any> {
    // Fetch the user without loading relationships initially
    const user = await this._userRepository.findOne({
      where: { id: userId },
      relations: ['role'], // Always load the role
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if the user is a member or staff and load the relevant relationship
    if (user.memberId) {
      // Load the member relationship if the user is a member
      const member = await this._memberRepository.findOne({
        where: { id: user.memberId },
      });

      if (!member) {
        throw new NotFoundException('Member not found');
      }

      // Exclude staffId and staff from the response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { staffId, staff, ...userData } = user;

      return {
        ...userData, // Spread user data without staffId and staff
        member, // Include the member details
      };
    } else if (user.staffId) {
      // Load the staff relationship if the user is a staff
      const staff = await this._staffRepository.findOne({
        where: { id: user.staffId },
      });

      if (!staff) {
        throw new NotFoundException('Staff not found');
      }

      // Exclude memberId and member from the response
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { memberId, member, ...userData } = user;

      return {
        ...userData, // Spread user data without memberId and member
        staff, // Include the staff details
      };
    } else {
      // If the user is neither a member nor a staff, return the user without relationships
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { memberId, staffId, member, staff, ...userData } = user;

      return {
        ...userData, // Spread user data without memberId, staffId, member, and staff
      };
    }
  }

  async remove(id: string, userType: string) {
    try {
      const user = await this._userRepository.findOne({
        where: { id },
      });

      if (userType === 'member') {
        const member = await this._memberRepository.findOne({
          where: { email: user.email },
        });

        if (!member) {
          throw new NotFoundException(
            'user email does not match the user email',
          );
        }

        member.isActive = false;

        await this._memberRepository.save(member);
      } else if (userType === 'staff') {
        const staff = await this._staffRepository.findOne({
          where: { email: user.email },
        });

        if (!staff) {
          throw new NotFoundException(
            'user email does not match the user email',
          );
        }

        staff.isActive = false;

        await this._staffRepository.save(staff);
      }

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await this._userRepository.remove(user);

      return {
        message: `Successfully deleted your account`,
        status: 'success',
      };
    } catch (error) {
      throw new HttpException(
        {
          message: 'Failed to delete your account',
          error: error.message || 'Internal Server Error',
          status: 'error',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
