import { User } from '@modules/user/entities/user.entity';
import { UserService } from '@modules/user/user.service';
import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private readonly _userService: UserService) {
    super();
  }

  // Serialize the user into the session
  serializeUser(user: User, done: (err: Error, user: { id: string }) => void) {
    done(null, { id: user.id }); // Store only the user ID in the session
  }

  // Deserialize the user from the session
  async deserializeUser(
    payload: { id: string },
    done: (err: Error, user: User) => void,
  ) {
    const user = await this._userService.findOne(payload.id); // Fetch the user by ID
    done(null, user); // Attach the user to the request object
  }
}
