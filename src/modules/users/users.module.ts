import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { DatabaseConfigModule } from "../../configs/databaseConfig.module";

@Module({
  imports: [DatabaseConfigModule],
  providers: [UsersService],
  exports: [DatabaseConfigModule],
})
export class UsersModule {}
