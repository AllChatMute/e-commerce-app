import { Module } from "@nestjs/common";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { CartRepositoryService } from "../../services/cartRepository.service";
import { ProductsRepositoryService } from "../../services/productsRepository.service";
import { CacheService } from "../../services/cache.service";

@Module({
  controllers: [CartController],
  providers: [
    CartService,
    CartRepositoryService,
    ProductsRepositoryService,
    CacheService,
  ],
})
export class CartModule {}
