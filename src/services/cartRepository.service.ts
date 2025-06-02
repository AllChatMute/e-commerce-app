import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";
import { Cart } from "../schemas/cart.schema";
import { Model } from "mongoose";
import { Product } from "src/schemas/product.schema";

@Injectable()
export class CartRepositoryService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<Cart>
  ) {}

  async createCart(email: string): Promise<Cart> {
    return await this.cartModel.insertOne({ ownerEmail: email });
  }

  async getCart(email: string): Promise<Cart | null> {
    return await this.cartModel.findOne({ ownerEmail: email });
  }

  async addProductToCart(
    ownerEmail: string,
    product: Product
  ): Promise<Cart | null> {
    return await this.cartModel.findOneAndUpdate(
      { ownerEmail },
      { $push: { products: product } },
      { new: true }
    );
  }
}
