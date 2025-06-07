import { Test, TestingModule } from "@nestjs/testing";
import { ProductsService } from "./products.service";
import { getModelToken } from "@nestjs/mongoose";
import { CreateProductDto } from "./types/createProductDto";
import { NotFoundException } from "@nestjs/common";
import { ProductsRepositoryService } from "../../services/productsRepository.service";

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

describe("ProductsService", () => {
  let service: ProductsService;
  let productsRepositoryService: ProductsRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: ProductsRepositoryService,
          useValue: {
            getAll: jest.fn().mockResolvedValue([]),
            getProductById: mockFunc,
            getProductsByMatchObjectFilters: jest
              .fn()
              .mockResolvedValue([returnedProduct]),
            createProduct: mockFunc,
            updateProduct: mockFunc,
            deleteProduct: mockFunc,
          },
        },
        {
          provide: getModelToken("Product"),
          useValue: {
            // findOne: mockFunc,
            // insertOne: mockFunc,
            // findOneAndUpdate: mockFunc,
            // findOneAndDelete: mockFunc,
            // find: jest.fn().mockResolvedValue([]),
            // aggregate: jest.fn().mockResolvedValue([returnedProduct]),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    productsRepositoryService = module.get<ProductsRepositoryService>(
      ProductsRepositoryService
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return created product", async () => {
    expect(await service.createProduct(createProduct)).toEqual(returnedProduct);

    expect(await service.createProduct(createProduct)).toEqual(
      expect.objectContaining({
        productId: expect.any(Number) as number,
        name: expect.any(String) as string,
        description: expect.any(String) as string,
        price: expect.any(Number) as number,
      })
    );
  });

  it("should return updated product", async () => {
    const response = await service.updateProduct(1, createProduct);
    expect(response).toEqual(returnedProduct);

    expect(response).toEqual(
      expect.objectContaining({
        productId: expect.any(Number) as number,
        name: expect.any(String) as string,
        description: expect.any(String) as string,
        price: expect.any(Number) as number,
      })
    );
  });

  it("should return single product", async () => {
    const response = await service.getProductById(1);

    expect(response).toEqual(returnedProduct);
    expect(response).toEqual(
      expect.objectContaining({
        productId: expect.any(Number) as number,
        name: expect.any(String) as string,
        description: expect.any(String) as string,
        price: expect.any(Number) as number,
      })
    );
  });

  it("should return an array of products", async () => {
    const response = await service.getProducts("mockName", "mock,test");

    expect(response).toEqual([returnedProduct]);
  });

  it("should throw 404 if not found in getProductById", async () => {
    jest
      .spyOn(productsRepositoryService, "getProductById")
      .mockResolvedValue(null);

    await expect(service.getProductById(1)).rejects.toThrow(NotFoundException);
  });

  it("should throw 404 if not found in updateProduct", async () => {
    jest
      .spyOn(productsRepositoryService, "updateProduct")
      .mockResolvedValue(null);

    await expect(service.updateProduct(1, createProduct)).rejects.toThrow(
      NotFoundException
    );
  });

  it("should throw 404 if not found in deleteProduct", async () => {
    jest
      .spyOn(productsRepositoryService, "deleteProduct")
      .mockResolvedValue(null);

    await expect(service.deleteProduct(1)).rejects.toThrow(NotFoundException);
  });
});
