import { Injectable } from "@nestjs/common";
import { CreateUserDto } from "../modules/auth/types/createUserDto";
import { Response } from "express";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class CookieService {
  constructor(private readonly jwtService: JwtService) {}

  async generateAuthCookie(
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
