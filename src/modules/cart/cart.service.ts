import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Product } from "../../schemas/product.schema";
import { CartRepositoryService } from "../../services/cartRepository.service";
import { Cart } from "src/schemas/cart.schema";

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

  async addProductToCart(ownerEmail: string, productId: number): Promise<Cart> {
    const product = await this.productModel.findOne({ productId }).lean();

    if (!product) throw new NotFoundException("Product not found");

    const updatedCart = await this.cartRepositoryService.addProductToCart(
      ownerEmail,
      { ...product, count: 1 }
    );
    if (!updatedCart)
      throw new InternalServerErrorException("Failed to add product");

    return updatedCart;
  }

  async deleteProductFromCart(
    ownerEmail: string,
    productId: number
  ): Promise<Cart> {
    const cart = await this.cartRepositoryService.deleteProductFromCart(
      ownerEmail,
      productId
    );
    if (!cart) throw new NotFoundException("Product not found");

    return cart;
  }
}
