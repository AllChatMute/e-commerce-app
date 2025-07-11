import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { Product } from "../../schemas/product.schema";
import { CreateProductDto } from "./types/createProductDto";
import { ProductsRepositoryService } from "../../services/productsRepository.service";
import { CacheService } from "../../services/cache.service";
import { HelpersService } from "../../services/helpers.service";

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepositoryService: ProductsRepositoryService,
    private readonly cacheService: CacheService,
    private readonly helpersService: HelpersService
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
    const products: Product[] = await this.productsRepositoryService.getAll();

    const productToCreate: Product = {
      productId: this.helpersService.generateId(products),
      ...product,
    };

    delete productToCreate.count;
    await this.cacheService.delete("/api/products");
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

    await this.cacheService.delete("/api/products");
    await this.cacheService.delete(`/api/products/${productId}`);

    return updatedProduct;
  }

  async deleteProduct(productId: number): Promise<undefined> {
    const deletedProduct =
      await this.productsRepositoryService.deleteProduct(productId);

    if (!deletedProduct) throw new NotFoundException("Product not Found");
    await this.cacheService.delete("/api/products");
    await this.cacheService.delete(`/api/products/${productId}`);
  }
}
