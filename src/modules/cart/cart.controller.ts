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
  UseInterceptors,
} from "@nestjs/common";
import { CartService } from "./cart.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { Request } from "express";
import { Roles } from "../../common/decorators/roles.decorator";
import { Role } from "../../types/role.enum";
import { RolesGuard } from "../../common/guards/roles.guard";
import { UserCacheInterceptor } from "../../common/interceptors/userCache.interceptor";
import { CacheKey } from "@nestjs/cache-manager";

export interface CartRequest extends Request {
  email: string;
}

@UseInterceptors(UserCacheInterceptor)
@Roles(Role.User)
@UseGuards(AuthGuard, RolesGuard)
@Controller("cart")
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @CacheKey("/api/cart")
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
