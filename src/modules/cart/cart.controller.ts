import { Controller, Get, Req, UseGuards } from "@nestjs/common";
import { CartService } from "./cart.service";
import { AuthGuard } from "../../guards/auth.guard";
import { Request } from "express";

@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(AuthGuard)
  @Get()
  getCartProducts(@Req() request: Request & { email: string }) {
    return this.cartService.getCartProducts(request);
  }
}
