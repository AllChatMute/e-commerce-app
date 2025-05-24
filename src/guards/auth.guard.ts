import { JwtService } from "@nestjs/jwt";
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Request } from "express";
import { ConfigService } from "@nestjs/config";

export interface AuthRequest extends Request {
  cookies: {
    auth?: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: AuthRequest = context.switchToHttp().getRequest();
    const token = request.cookies.auth;
    if (!token) throw new UnauthorizedException();

    try {
      await this.jwtService.verifyAsync(token, {
        secret: this.configService.get("JWT_SECRET_KEY"),
      });
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }
}
