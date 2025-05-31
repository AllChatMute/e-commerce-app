import { HashService } from "./../../services/hash.service";
import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
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
    if (await this.usersService.findUser(user.email))
      throw new UnauthorizedException("User already exists");

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

  async signIn(
    user: CreateUserDto,
    res: Response
  ): Promise<{ accessToken: string }> {
    const foundedUser = await this.usersService.findUser(user.email);

    if (!foundedUser) throw new UnauthorizedException("User not found");
    if (!(await this.hashService.compare(user.password, foundedUser.password)))
      throw new UnauthorizedException("Invalid password");

    try {
      return this.generateAuthCookie(user, res);
    } catch {
      throw new InternalServerErrorException("Failed to login");
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
