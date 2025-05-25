import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./types/createProductDto";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(":id")
  getProductById(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.getProductById(id);
  }

  @Post()
  createProduct(@Body() product: CreateProductDto) {
    return this.productsService.createProduct(product);
  }

  @Put(":id")
  updateProduct(
    @Body() product: CreateProductDto,
    @Param("id", ParseIntPipe) id: number
  ) {
    return this.productsService.updateProduct(id, product);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  deleteProduct(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.deleteProduct(id);
  }
}
