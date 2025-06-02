import {
  Controller,
  Get,
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

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(AuthGuard)
  @Get()
  getCartProducts(@Req() request: CartRequest) {
    return this.cartService.getCartProducts(request.email);
  }

  @UseGuards(AuthGuard)
  @Post(":id")
  addProductToCart(
    @Param("id", ParseIntPipe) id: number,
    @Req() request: CartRequest
  ) {
    return this.cartService.addProductToCart(request.email, id);
  }
}
