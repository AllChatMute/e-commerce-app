import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Product } from "../../schemas/product.schema";
import { Model } from "mongoose";
import { CreateProductDto } from "./types/createProductDto";

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>
  ) {}

  async getProductById(productId: number): Promise<Product> {
    const product = await this.productModel.findOne({ productId });
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

    return await this.productModel.aggregate([
      {
        $match: matchObject,
      },
    ]);
  }

  async createProduct(product: CreateProductDto): Promise<Product> {
    const productToCreate = {
      productId: await this.generateId(),
      ...product,
    };
    try {
      return await this.productModel.insertOne(productToCreate);
    } catch {
      throw new InternalServerErrorException("Failed to create product");
    }
  }

  async updateProduct(
    productId: number,
    product: CreateProductDto
  ): Promise<Product> {
    const updatedProduct = await this.productModel.findOneAndUpdate(
      { productId },
      product,
      { new: true }
    );

    if (!updatedProduct) throw new NotFoundException("Product not found");

    return updatedProduct;
  }

  async deleteProduct(productId: number): Promise<undefined> {
    const deletedProduct = await this.productModel.findOneAndDelete({
      productId,
    });

    if (!deletedProduct) throw new NotFoundException("Product not Found");
  }

  private async generateId() {
    const products: Product[] = await this.productModel.find();

    return products.length > 0
      ? Math.max(...products.map((item) => item.productId)) + 1
      : 1;
  }
}
