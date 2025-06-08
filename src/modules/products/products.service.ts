import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Product } from "../../schemas/product.schema";
import { CreateProductDto } from "./types/createProductDto";
import { ProductsRepositoryService } from "../../services/productsRepository.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepositoryService: ProductsRepositoryService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
  ) {}

  async getProductById(productId: number): Promise<Product> {
    const product =
      await this.productsRepositoryService.getProductById(productId);
    if (!product) throw new NotFoundException("Product not found");

    return product;
  }

  async getProducts(name?: string, categories?: string): Promise<Product[]> {
    const parsedCategories = categories?.split(",") || [];
    const parsedName = name || "";

    const matchObject = {};
    const options = [
      { name: { $regex: parsedName, $options: "i" } },
      {
        categories: {
          $all: parsedCategories,
        },
      },
    ];

    if (parsedCategories.length > 0) {
      matchObject["$and"] = options;
    } else {
      matchObject["$or"] = options;
    }

    return await this.productsRepositoryService.getProductsByMatchObjectFilters(
      matchObject
    );
  }

  async createProduct(product: CreateProductDto): Promise<Product> {
    const productToCreate: Product = {
      productId: await this.generateId(),
      ...product,
    };

    delete productToCreate.count;
    await this.cacheManager.del("/api/products");
    try {
      return await this.productsRepositoryService.createProduct(
        productToCreate
      );
    } catch {
      throw new InternalServerErrorException("Failed to create product");
    }
  }

  async updateProduct(
    productId: number,
    product: CreateProductDto
  ): Promise<Product> {
    delete product.count;
    const updatedProduct = await this.productsRepositoryService.updateProduct(
      productId,
      product
    );

    if (!updatedProduct) throw new NotFoundException("Product not found");
    await this.cacheManager.del("/api/products");
    await this.cacheManager.del(`/api/products/${productId}`);

    return updatedProduct;
  }

  async deleteProduct(productId: number): Promise<undefined> {
    const deletedProduct =
      await this.productsRepositoryService.deleteProduct(productId);

    if (!deletedProduct) throw new NotFoundException("Product not Found");
    await this.cacheManager.del("/api/products");
    await this.cacheManager.del(`/api/products/${productId}`);
  }

  private async generateId() {
    const products: Product[] = await this.productsRepositoryService.getAll();

    return products.length > 0
      ? Math.max(...products.map((item) => item.productId)) + 1
      : 1;
  }
}
