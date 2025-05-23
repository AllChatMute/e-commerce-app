import { Body, Controller, Post, Res } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./types/createUserDto";
import { ValidateEmailPipe } from "../../pipes/validateEmail.pipe";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  signUp(
    @Body(ValidateEmailPipe) user: CreateUserDto,
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.signUp(user, response);
  }
}
