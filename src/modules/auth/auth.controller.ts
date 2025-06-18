import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./types/createUserDto";
import { ValidateEmailPipe } from "../../common/pipes/validateEmail.pipe";
import { Response } from "express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post("register")
  signUp(
    @Body(ValidateEmailPipe) user: CreateUserDto,
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.signUp(user, response);
  }

  @HttpCode(HttpStatus.OK)
  @Post("login")
  signIn(
    @Body(ValidateEmailPipe) user: CreateUserDto,
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.signIn(user, response);
  }
}
