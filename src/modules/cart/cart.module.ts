import { Module } from "@nestjs/common";
import { CartService } from "./cart.service";
import { CartController } from "./cart.controller";
import { CartRepositoryService } from "../../services/cartRepository.service";

@Module({
  controllers: [CartController],
  providers: [CartService, CartRepositoryService],
})
export class CartModule {}
