import { Module } from "@nestjs/common";
import { PrismaService } from "./services/prisma.service";

@Module({
  imports: [],
  providers: [PrismaService],
})
export class AppModule {}
