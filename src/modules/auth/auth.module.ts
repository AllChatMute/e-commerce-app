import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { HashService } from "../../services/hash.service";
import { CookieService } from "../../services/cookie.service";
import { CartRepositoryService } from "../../services/cartRepository.service";

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      global: true,
      useFactory: (configService: ConfigService) => ({
        secret: configService.get("JWT_SECRET_KEY"),
        signOptions: {
          expiresIn: "15m",
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, CartRepositoryService, HashService, CookieService],
})
export class AuthModule {}
