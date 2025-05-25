import { Module } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { DatabaseConfigModule } from "src/configs/databaseConfig.module";

@Module({
  imports: [DatabaseConfigModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
