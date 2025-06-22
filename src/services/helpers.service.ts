import { Injectable } from "@nestjs/common";
import { Product } from "../schemas/product.schema";

@Injectable()
export class HelpersService {
  generateId(products: Product[]): number {
    return products.length > 0
      ? Math.max(...products.map((item) => item.productId)) + 1
      : 1;
  }
}
