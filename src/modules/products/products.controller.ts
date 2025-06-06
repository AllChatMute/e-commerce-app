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
  Query,
  UseGuards,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./types/createProductDto";
import { AuthGuard } from "../../guards/auth.guard";
import { Roles } from "../../decorators/roles.decorator";
import { Role } from "../../types/role.enum";
import { RolesGuard } from "src/guards/roles.guard";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getProducts(
    @Query("name") name: string,
    @Query("categories") categories: string
  ) {
    return this.productsService.getProducts(name, categories);
  }

  @Get(":id")
  getProductById(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.getProductById(id);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Post()
  createProduct(@Body() product: CreateProductDto) {
    return this.productsService.createProduct(product);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @Put(":id")
  updateProduct(
    @Body() product: CreateProductDto,
    @Param("id", ParseIntPipe) id: number
  ) {
    return this.productsService.updateProduct(id, product);
  }

  @Roles(Role.Admin)
  @UseGuards(AuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  deleteProduct(@Param("id", ParseIntPipe) id: number) {
    return this.productsService.deleteProduct(id);
  }
}
