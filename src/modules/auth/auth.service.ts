import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";

import { CreateUserDto } from "./types/createUserDto";
import { User } from "src/schemas/user.schema";

@Injectable()
export class AuthService {
  constructor(private readonly users: UsersService) {}

  async signUp(user: CreateUserDto): Promise<User> {
    return this.users.createUser(user);
  }
}
