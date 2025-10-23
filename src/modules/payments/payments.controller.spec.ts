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
import { Status } from "../../types/status.enum";
import { BadRequestException, NotFoundException } from "@nestjs/common";

const mockRequest = {
  email: "mock@mail.com",
} as unknown as RequestWithEmail;

const mockCreatePaymentDto: CreatePaymentDto = {
  amount: 1000,
  currency: Currency.RUB,
};

const mockReturnedPayment = {
  email: "mock@mail.com",
  amount: 1000,
  currency: Currency.RUB,
  status: Status.ACCEPTED,
};

const mockMongooseId = "688fa2338331d6a502805362";

describe("PaymentsController", () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: {
            createPayment: jest.fn().mockReturnValue(mockReturnedPayment),
            getPaymentById: jest.fn().mockReturnValue(mockReturnedPayment),
            refundPayment: jest.fn().mockReturnValue(mockReturnedPayment),
          },
        },
        PaymentsRepositoryService,
        { provide: getModelToken("Payment"), useValue: {} },
        JwtService,
        ConfigService,
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should return created payment ", async () => {
    expect(
      await controller.createPayment(mockCreatePaymentDto, mockRequest)
    ).toEqual(mockReturnedPayment);
  });

  it("should return payment by id", async () => {
    expect(await controller.getPaymentById(mockMongooseId)).toEqual(
      mockReturnedPayment
    );
  });

  it("should return refunded payment", async () => {
    expect(await controller.refundPayment(mockMongooseId)).toEqual(
      mockReturnedPayment
    );
  });

  it("should throw 400 if invalid id", async () => {
    jest
      .spyOn(service, "getPaymentById")
      .mockRejectedValue(new BadRequestException());

    await expect(controller.getPaymentById(mockMongooseId)).rejects.toThrow(
      BadRequestException
    );
  });

  it("should throw 400 if invalid id", async () => {
    jest
      .spyOn(service, "refundPayment")
      .mockRejectedValue(new BadRequestException());

    await expect(controller.refundPayment(mockMongooseId)).rejects.toThrow(
      BadRequestException
    );
  });

  it("should throw 404 if payment not found", async () => {
    jest
      .spyOn(service, "refundPayment")
      .mockRejectedValue(new NotFoundException());

    await expect(controller.refundPayment(mockMongooseId)).rejects.toThrow(
      NotFoundException
    );
  });
});
