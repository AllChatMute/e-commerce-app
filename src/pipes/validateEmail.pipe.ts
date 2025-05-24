import { BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { CreateUserDto } from "../modules/auth/types/createUserDto";

const emailRegex =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

@Injectable()
export class ValidateEmailPipe implements PipeTransform {
  transform(value: CreateUserDto) {
    const { email } = value;

    if (!emailRegex.test(email)) throw new BadRequestException("Invalid email");
    return value;
  }
}
