import { Test, TestingModule } from "@nestjs/testing";
import { CartService } from "./cart.service";
import { getModelToken } from "@nestjs/mongoose";
import { CartRepositoryService } from "../../services/cartRepository.service";

describe("CartService", () => {
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        CartRepositoryService,
        {
          provide: getModelToken("Cart"),
          useValue: {},
        },
        {
          provide: getModelToken("Product"),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
