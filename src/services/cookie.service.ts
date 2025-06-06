import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "../modules/auth/types/createUserDto";
import { Response } from "express";
import { JwtService } from "@nestjs/jwt";
import { Role } from "../types/role.enum";

@Injectable()
export class CookieService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAuthCookie(
    user: CreateUserDto & { roles: Role[] },
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
