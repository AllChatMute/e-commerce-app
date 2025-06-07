import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Query } from "mongoose";
import { Product } from "../schemas/product.schema";
import { CreateProductDto } from "../modules/products/types/createProductDto";

@Injectable()
export class ProductsRepositoryService {
  constructor(
    @InjectModel(Product.name) private readonly productModel: Model<Product>
  ) {}

  async getAll(): Promise<Product[]> {
    return await this.productModel.find();
  }

  getProductById(productId: number): Query<Product | null, Product> {
    return this.productModel.findOne({ productId });
  }

  async getProductsByMatchObjectFilters(
    matchObject: object
  ): Promise<Product[]> {
    return await this.productModel.aggregate([
      {
        $match: matchObject,
      },
    ]);
  }

  async createProduct(product: Product): Promise<Product> {
    return await this.productModel.insertOne(product);
  }

  async updateProduct(
    productId: number,
    product: CreateProductDto
  ): Promise<Product | null> {
    return await this.productModel.findOneAndUpdate({ productId }, product, {
      new: true,
    });
  }

  async deleteProduct(productId: number): Promise<Product | null> {
    return await this.productModel.findOneAndDelete({ productId });
  }
}
