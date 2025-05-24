import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "../auth/types/createUserDto";
import { User } from "../../schemas/user.schema";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(user: CreateUserDto): Promise<User> {
    return await this.userModel.insertOne(user);
  }

  async findUser(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email });
  }
}
