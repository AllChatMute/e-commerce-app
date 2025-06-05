import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { CartService } from "./cart.service";
import { AuthGuard } from "../../guards/auth.guard";
import { Request } from "express";

export interface CartRequest extends Request {
  email: string;
}

@UseGuards(AuthGuard)
@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCartProducts(@Req() request: CartRequest) {
    return this.cartService.getCartProducts(request.email);
  }

  @HttpCode(HttpStatus.OK)
  @Post(":id")
  addProductToCart(
    @Param("id", ParseIntPipe) id: number,
    @Req() request: CartRequest
  ) {
    return this.cartService.addProductToCart(request.email, id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(":id")
  deleteProductFromCart(
    @Param("id", ParseIntPipe) id: number,
    @Req() request: CartRequest
  ) {
    return this.cartService.deleteProductFromCart(request.email, id);
  }

  @Delete("dec/:id")
  decreaseProductCount(
    @Param("id", ParseIntPipe) id: number,
    @Req() request: CartRequest
  ) {
    return this.cartService.decreaseProductCount(request.email, id);
  }
}
