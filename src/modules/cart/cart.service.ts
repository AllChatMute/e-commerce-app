import { Injectable, NotFoundException } from "@nestjs/common";
import { Request } from "express";
import { Product } from "src/schemas/product.schema";
import { CartRepositoryService } from "src/services/cartRepository.service";

@Injectable()
export class CartService {
  constructor(private readonly cartRepositoryService: CartRepositoryService) {}

  async getCartProducts(
    request: Request & { email: string }
  ): Promise<Product[]> {
    const cart = await this.cartRepositoryService.getCart(request.email);

    if (!cart) throw new NotFoundException();

    return cart.products;
  }
}
