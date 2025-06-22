import { Module } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { ProductsRepositoryService } from "../../services/productsRepository.service";
import { CacheService } from "../../services/cache.service";
import { HelpersService } from "../../services/helpers.service";

@Module({
  controllers: [ProductsController],
  providers: [
    ProductsService,
    ProductsRepositoryService,
    CacheService,
    HelpersService,
  ],
})
export class ProductsModule {}
