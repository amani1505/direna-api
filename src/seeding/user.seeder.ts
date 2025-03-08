import { User } from '@modules/user/entities/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as bcrypt from 'bcrypt';
import { Role } from '@modules/roles/entities/role.entity';

@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(User)
    private readonly _userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly _roleRepository: Repository<Role>,
  ) {}

  async seed() {
    // Read the user data from a JSON file
    const users = JSON.parse(fs.readFileSync('src/assets/user.json', 'utf8'));

    for (const user of users) {
      const existingUser = await this._userRepository.findOne({
        where: { email: user.email },
      });

      const role = await this._roleRepository.findOne({
        where: { name: user.role_name },
      });

      if (!existingUser) {
        // Create a new user
        const newUser = new User();
        newUser.username = user.username;
        newUser.email = user.email;
        newUser.password = await bcrypt.hash(user.password, 10); // Hash the password
        newUser.roleId = role.id;

        await this._userRepository.save(newUser);
      } else {
        // Update the existing user
        existingUser.username = user.username;
        existingUser.email = user.email;
        existingUser.password = await bcrypt.hash(user.password, 10); // Hash the password
        existingUser.roleId = role.id;

        await this._userRepository.save(existingUser);
      }
    }
  }
}
