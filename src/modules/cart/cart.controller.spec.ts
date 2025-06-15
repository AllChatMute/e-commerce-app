import { Test, TestingModule } from "@nestjs/testing";
import { CartController, CartRequest } from "./cart.controller";
import { CartService } from "./cart.service";
import { CartRepositoryService } from "../../services/cartRepository.service";
import { getModelToken } from "@nestjs/mongoose";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { NotFoundException } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Reflector } from "@nestjs/core";
import { UserCacheInterceptor } from "../../interceptors/userCache.interceptor";

const mockProduct = {
  productId: 1,
  name: "mockName",
  description: "mockDescription",
  price: 3000,
  categories: ["mock", "test"],
  count: 1,
};

const mockCart = {
  ownerEmail: "test@mail.com",
  products: [mockProduct],
};

const mockRequest = {
  email: "test@mail.com",
} as unknown as CartRequest;

describe("CartController", () => {
  let controller: CartController;
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: {
            getCartProducts: jest.fn().mockResolvedValue([mockProduct]),
            addProductToCart: jest.fn().mockResolvedValue(mockCart),
            deleteProductFromCart: jest.fn().mockResolvedValue([]),
            decreaseProductCount: jest.fn().mockResolvedValue({
              ...mockCart,
              products: [
                {
                  ...mockProduct,
                  count: mockProduct.count - 1,
                },
              ],
            }),
          },
        },
        CartRepositoryService,
        {
          provide: getModelToken("Cart"),
          useValue: {},
        },
        {
          provide: getModelToken("Product"),
          useValue: {},
        },
        JwtService,
        ConfigService,
        { provide: CACHE_MANAGER, useValue: {} },
        { provide: Reflector, useValue: {} },
        {
          provide: UserCacheInterceptor,
          useValue: {
            trackBy: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
    service = module.get<CartService>(CartService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return cart products", async () => {
    expect(await controller.getCartProducts(mockRequest)).toEqual([
      mockProduct,
    ]);
  });

  it("should return cart with added product", async () => {
    expect(await controller.addProductToCart(1, mockRequest)).toEqual(mockCart);
  });

  it("should return cart without deleted product", async () => {
    expect(await controller.deleteProductFromCart(1, mockRequest)).toEqual([]);
  });

  it("should return cart with product's count decreamented by 1", async () => {
    const response = await controller.decreaseProductCount(1, mockRequest);

    expect(response).toEqual({
      ...mockCart,
      products: [
        {
          ...mockProduct,
          count: mockProduct.count - 1,
        },
      ],
    });
  });

  it("should throw 404 if product not found by id", async () => {
    jest
      .spyOn(service, "addProductToCart")
      .mockRejectedValue(new NotFoundException());

    await expect(controller.addProductToCart(0, mockRequest)).rejects.toThrow(
      NotFoundException
    );
  });

  it("should throw 404 if product not found to delete", async () => {
    jest
      .spyOn(service, "deleteProductFromCart")
      .mockRejectedValue(new NotFoundException());

    await expect(
      controller.deleteProductFromCart(0, mockRequest)
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw 404 if product not found to decrease count", async () => {
    jest
      .spyOn(service, "decreaseProductCount")
      .mockRejectedValue(new NotFoundException());

    await expect(
      controller.decreaseProductCount(0, mockRequest)
    ).rejects.toThrow(NotFoundException);
  });
});
