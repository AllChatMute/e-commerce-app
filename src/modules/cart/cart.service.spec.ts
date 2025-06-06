import { Test, TestingModule } from "@nestjs/testing";
import { CartService } from "./cart.service";
import { getModelToken } from "@nestjs/mongoose";
import { CartRepositoryService } from "../../services/cartRepository.service";
import { Model } from "mongoose";
import { Product } from "../../schemas/product.schema";
import {
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";

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

const mockFunc = jest.fn().mockResolvedValue(mockCart);

describe("CartService", () => {
  let service: CartService;
  let productModel: Model<Product>;
  let cartRepository: CartRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: CartRepositoryService,
          useValue: {
            createCart: mockFunc,
            getCart: mockFunc,
            addProductToCart: mockFunc,
            decreaseProductCount: jest.fn().mockResolvedValue({
              ...mockCart,
              products: [
                {
                  ...mockProduct,
                  count: mockProduct.count - 1,
                },
              ],
            }),
            deleteProductFromCart: jest
              .fn()
              .mockResolvedValue({ ...mockCart, products: [] }),
          },
        },
        {
          provide: getModelToken("Cart"),
          useValue: {},
        },
        {
          provide: getModelToken("Product"),
          useValue: {
            findOne: jest.fn().mockReturnThis(),
            lean: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    productModel = module.get<Model<Product>>(getModelToken("Product"));
    cartRepository = module.get<CartRepositoryService>(CartRepositoryService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return cart products", async () => {
    expect(await service.getCartProducts("test@mail.com")).toEqual([
      mockProduct,
    ]);
  });

  it("should return cart with added product", async () => {
    jest.spyOn(productModel.findOne(), "lean").mockResolvedValue(mockProduct);
    expect(await service.addProductToCart("test@mail.com", 1)).toEqual(
      mockCart
    );
  });

  it("should return cart without deleted product", async () => {
    expect(await service.deleteProductFromCart("test@mail.com", 1)).toEqual({
      ...mockCart,
      products: [],
    });
  });

  it("should return cart with product's count decreamented by 1", async () => {
    const response = await service.decreaseProductCount("test@mail.com", 1);

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

  it("should throw 500 if failed to create cart", async () => {
    jest.spyOn(cartRepository, "createCart").mockResolvedValue(null);

    await expect(service.getCartProducts("test@mail.com")).rejects.toThrow(
      InternalServerErrorException
    );
  });

  it("should throw 404 if product to add not found", async () => {
    jest.spyOn(productModel.findOne(), "lean").mockResolvedValue(null);

    await expect(service.addProductToCart("test@mail.com", 1)).rejects.toThrow(
      NotFoundException
    );
  });

  it("should throw 500 if failed to create product", async () => {
    jest.spyOn(productModel.findOne(), "lean").mockResolvedValue(mockProduct);
    jest.spyOn(cartRepository, "addProductToCart").mockResolvedValue(null);

    await expect(service.addProductToCart("test@mail.com", 1)).rejects.toThrow(
      InternalServerErrorException
    );
  });

  it("should throw 404 if product to decrease count not found", async () => {
    jest.spyOn(cartRepository, "decreaseProductCount").mockResolvedValue(null);

    await expect(
      service.decreaseProductCount("test@mail.com", 1)
    ).rejects.toThrow(NotFoundException);
  });

  it("should throw 404 if product to delete not found", async () => {
    jest.spyOn(cartRepository, "deleteProductFromCart").mockResolvedValue(null);

    await expect(
      service.deleteProductFromCart("test@mail.com", 1)
    ).rejects.toThrow(NotFoundException);
  });
});
