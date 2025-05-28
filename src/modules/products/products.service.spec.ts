import { Test, TestingModule } from "@nestjs/testing";
import { ProductsService } from "./products.service";
import { getModelToken } from "@nestjs/mongoose";
import { CreateProductDto } from "./types/createProductDto";

const createProduct: CreateProductDto = {
  name: "mockName",
  description: "mockDescription",
  price: 3000,
  categories: ["mock", "test"],
};
const returnedProduct = {
  productId: 1,
  name: "mockName",
  description: "mockDescription",
  price: 3000,
  categories: ["mock", "test"],
};

describe("ProductsService", () => {
  let service: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ProductsService,
          useValue: {
            createProduct: jest.fn().mockResolvedValue(returnedProduct),
          },
        },
        {
          provide: getModelToken("Product"),
          useValue: {
            findOne: jest.fn().mockResolvedValue(returnedProduct),
            insertOne: jest.fn().mockResolvedValue(returnedProduct),
            findOneAndUpdate: jest.fn().mockResolvedValue(returnedProduct),
            findOneAndDelete: jest.fn().mockResolvedValue(returnedProduct),
          },
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
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
});
