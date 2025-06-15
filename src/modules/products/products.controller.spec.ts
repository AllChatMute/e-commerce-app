import { Test, TestingModule } from "@nestjs/testing";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./types/createProductDto";
import { getModelToken } from "@nestjs/mongoose";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { NotFoundException } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Reflector } from "@nestjs/core";
import { SelectiveCacheInterceptor } from "../../interceptors/selectiveCache.interceptor";

const createProduct: CreateProductDto = {
  name: "mockName",
  description: "mockDescription",
  price: 3000,
  categories: ["mock", "test"],
};

const returnedProduct = {
  productId: 1,
  ...createProduct,
};

const mockFunc = jest.fn().mockResolvedValue(returnedProduct);

describe("ProductsController", () => {
  let controller: ProductsController;
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: {
            createProduct: mockFunc,
            updateProduct: mockFunc,
            getProductById: mockFunc,
            getProducts: jest.fn().mockResolvedValue([returnedProduct]),
            deleteProduct: jest.fn().mockResolvedValue(undefined),
          },
        },
        { provide: getModelToken("Product"), useValue: {} },
        JwtService,
        ConfigService,
        { provide: CACHE_MANAGER, useValue: {} },
        { provide: Reflector, useValue: {} },
        {
          provide: SelectiveCacheInterceptor,
          useValue: { isRequestCacheable: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return created product", async () => {
    const response = await controller.createProduct(createProduct);
    expect(response).toEqual(returnedProduct);

    expect(response).toEqual(
      expect.objectContaining({
        productId: expect.any(Number) as number,
        name: expect.any(String) as string,
        description: expect.any(String) as string,
        price: expect.any(Number) as number,
      })
    );
    expect(response).toHaveProperty("categories");
  });

  it("should return updated product", async () => {
    const response = await controller.updateProduct(createProduct, 1);
    expect(response).toEqual(returnedProduct);

    expect(response).toEqual(
      expect.objectContaining({
        productId: expect.any(Number) as number,
        name: expect.any(String) as string,
        description: expect.any(String) as string,
        price: expect.any(Number) as number,
      })
    );
    expect(response).toHaveProperty("categories");
  });

  it("should return single product", async () => {
    const response = await controller.getProductById(1);

    expect(response).toEqual(returnedProduct);
    expect(response).toEqual(
      expect.objectContaining({
        productId: expect.any(Number) as number,
        name: expect.any(String) as string,
        description: expect.any(String) as string,
        price: expect.any(Number) as number,
      })
    );
    expect(response).toHaveProperty("categories");
  });

  it("should return an array of products", async () => {
    const response = await controller.getProducts("mockName", "mock,test");

    expect(response).toEqual([returnedProduct]);
  });

  it("should throw 404 if not found in getProductById", async () => {
    jest
      .spyOn(service, "getProductById")
      .mockRejectedValue(new NotFoundException());

    await expect(controller.getProductById(1)).rejects.toThrow(
      NotFoundException
    );
  });

  it("should throw 404 if not found in updateProduct", async () => {
    jest
      .spyOn(service, "updateProduct")
      .mockRejectedValue(new NotFoundException());

    await expect(controller.updateProduct(createProduct, 1)).rejects.toThrow(
      NotFoundException
    );
  });

  it("should throw 404 if not found in deleteProduct", async () => {
    jest
      .spyOn(service, "deleteProduct")
      .mockRejectedValue(new NotFoundException());

    await expect(controller.deleteProduct(1)).rejects.toThrow(
      NotFoundException
    );
  });
});
