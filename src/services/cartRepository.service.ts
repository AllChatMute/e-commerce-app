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

  async getCart(email: string): Promise<Cart | null> {
    return await this.cartModel.findOne({ ownerEmail: email });
  }

  async addProductToCart(
    ownerEmail: string,
    product: Product
  ): Promise<Cart | null> {
    const updatedCart = await this.cartModel.findOneAndUpdate(
      {
        ownerEmail,
        "products.productId": product.productId,
      },
      {
        $inc: {
          "products.$.count": 1,
        },
      },
      { new: true }
    );

    if (!updatedCart) {
      return this.cartModel.findOneAndUpdate(
        {
          ownerEmail,
        },
        { $addToSet: { products: product } },
        { new: true, upsert: true }
      );
    }
    return updatedCart;
  }

  async decreaseProductCount(
    ownerEmail: string,
    productId: number
  ): Promise<Cart | null> {
    const cart = await this.cartModel.findOne({
      ownerEmail,
      "products.productId": productId,
    });

    if (!cart) {
      return null;
    }

    const product = cart.products.find((p) => p.productId === productId);

    if (!product) {
      return cart;
    }

    if (product.count === 1) {
      return this.cartModel.findOneAndUpdate(
        { ownerEmail },
        { $pull: { products: { productId } } },
        { new: true }
      );
    } else {
      return this.cartModel.findOneAndUpdate(
        {
          ownerEmail,
          "products.productId": productId,
        },
        {
          $inc: {
            "products.$.count": -1,
          },
        },
        { new: true }
      );
    }
  }

  async deleteProductFromCart(
    ownerEmail: string,
    productId: number
  ): Promise<Cart | null> {
    return await this.cartModel.findOneAndUpdate(
      { ownerEmail },
      { $pull: { products: { productId } } },
      { new: true }
    );
  }
}
