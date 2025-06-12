import { CacheService } from "./../../services/cache.service";
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Product } from "../../schemas/product.schema";
import { CartRepositoryService } from "../../services/cartRepository.service";
import { Cart } from "../../schemas/cart.schema";
import { ProductsRepositoryService } from "../../services/productsRepository.service";

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepositoryService: CartRepositoryService,
    private readonly productsRepositoryService: ProductsRepositoryService,
    private readonly cacheService: CacheService
  ) {}

  async getCartProducts(ownerEmail: string): Promise<Product[]> {
    const cart = await this.cartRepositoryService.getCart(ownerEmail);
    if (!cart) {
      const createdCart =
        await this.cartRepositoryService.createCart(ownerEmail);
      if (!createdCart)
        throw new InternalServerErrorException("Failed to create cart");
      return createdCart.products;
    }
    return cart.products;
  }

  async addProductToCart(ownerEmail: string, productId: number): Promise<Cart> {
    const product = (await this.productsRepositoryService
      .getProductById(productId)
      .lean()) as unknown as Product;

    if (!product) throw new NotFoundException("Product not found");

    const updatedCart = await this.cartRepositoryService.addProductToCart(
      ownerEmail,
      { ...product, count: 1 }
    );
    if (!updatedCart)
      throw new InternalServerErrorException("Failed to add product");
    await this.cacheService.delete(`${ownerEmail}/api/cart`);

    return updatedCart;
  }

  async decreaseProductCount(ownerEmail: string, productId: number) {
    const cart = await this.cartRepositoryService.decreaseProductCount(
      ownerEmail,
      productId
    );

    if (!cart) throw new NotFoundException("Product not found");
    await this.cacheService.delete(`${ownerEmail}/api/cart`);

    return cart;
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
    await this.cacheService.delete(`${ownerEmail}/api/cart`);

    return cart;
  }
}
