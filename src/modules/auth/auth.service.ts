import { HashService } from "./../../services/hash.service";
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";

import { CreateUserDto } from "./types/createUserDto";
import { JwtService } from "@nestjs/jwt";
import { Response } from "express";

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly hashService: HashService,
    private readonly jwtService: JwtService
  ) {}

  async signUp(
    user: CreateUserDto,
    res: Response
  ): Promise<{ accessToken: string }> {
    if (await this.usersService.isExists(user.email))
      throw new BadRequestException("User already exists");

    const userToCreate = {
      email: user.email,
      password: await this.hashService.hash(user.password),
    };

    try {
      await this.usersService.createUser(userToCreate);
      return this.generateAuthCookie(user, res);
    } catch {
      throw new InternalServerErrorException("Failed to register");
    }
  }

  private async generateAuthCookie(
    user: CreateUserDto,
    response: Response
  ): Promise<{ accessToken: string }> {
    const accessToken = await this.jwtService.signAsync(user);

    response.cookie("auth", accessToken, {
      maxAge: 15 * 60 * 1000,
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    return { accessToken };
  }
}
