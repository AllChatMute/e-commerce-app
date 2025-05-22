import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "../auth/types/createUserDto";
import { User } from "src/schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  async createUser(user: CreateUserDto): Promise<User> {
    return await this.UserModel.insertOne(user);
  }
}
