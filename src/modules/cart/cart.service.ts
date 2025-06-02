import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { Product } from "../../schemas/product.schema";
import { CartRepositoryService } from "../../services/cartRepository.service";

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepositoryService: CartRepositoryService,
    @InjectModel(Product.name) private readonly productModel: Model<Product>
  ) {}

  async getCartProducts(ownerEmail: string): Promise<Product[]> {
    const cart = await this.cartRepositoryService.getCart(ownerEmail);

    if (!cart) throw new NotFoundException();

    return cart.products;
  }

  async addProductToCart(ownerEmail: string, productId: number) {
    const product = await this.productModel.findOne({ productId });
    if (!product) throw new NotFoundException("Product not found");

    await this.cartRepositoryService.addProductToCart(ownerEmail, product);
  }
}
