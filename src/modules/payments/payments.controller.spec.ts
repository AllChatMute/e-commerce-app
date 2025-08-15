import { Test, TestingModule } from "@nestjs/testing";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { PaymentsRepositoryService } from "../../services/paymentRepository.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { getModelToken } from "@nestjs/mongoose";
import { RequestWithEmail } from "../../types/requestWithEmail.interface";
import { CreatePaymentDto } from "./types/createPaymentDto";
import { Currency } from "../../types/currency.enum";

const mockRequest = {
  email: "mock@mail.com",
} as unknown as RequestWithEmail;

const mockCreatePaymentDto: CreatePaymentDto = {
  amount: 1000,
  currency: Currency.RUB,
};

describe("PaymentsController", () => {
  let controller: PaymentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        { provide: PaymentsService, useValue: {} },
        PaymentsRepositoryService,
        { provide: getModelToken("Payment"), useValue: {} },
        JwtService,
        ConfigService,
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return created payment ", async () => {
    expect(await controller.createPayment(mockCreatePaymentDto, mockRequest)).;
  });
});
