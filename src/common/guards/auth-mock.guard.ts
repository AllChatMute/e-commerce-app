import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";
import { Role } from "../../types/role.enum";

@Injectable()
export class AuthMockGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    request["email"] = "admin@email.com";
    request["roles"] = [Role.User, Role.Admin];

    return true;
  }
}
