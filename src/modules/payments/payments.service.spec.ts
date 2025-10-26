import { Test, TestingModule } from "@nestjs/testing";
import { PaymentsService } from "./payments.service";
import { PaymentsRepositoryService } from "../../services/paymentRepository.service";
import { getModelToken } from "@nestjs/mongoose";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { RequestWithEmail } from "../../types/requestWithEmail.interface";
import { Currency } from "../../types/currency.enum";
import { CreatePaymentDto } from "./types/createPaymentDto";
import { Payment } from "../../schemas/payment.schema";
import { Status } from "../../types/status.enum";
import { BadRequestException, NotFoundException } from "@nestjs/common";

const mockMongooseId = "688fa2338331d6a502805362";

const mockRequest = {
  email: "mock@mail.com",
} as unknown as RequestWithEmail;

const mockCreatePaymentDto: CreatePaymentDto = {
  amount: 1000,
  currency: Currency.RUB,
};

describe("PaymentsService", () => {
  let service: PaymentsService;
  let repository: PaymentsRepositoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PaymentsRepositoryService,
          useValue: {
            create: jest.fn().mockReturnValue({
              ...mockRequest,
              ...mockCreatePaymentDto,
              status: Status.ACCEPTED,
            }),
            getById: jest.fn().mockReturnValue({
              ...mockRequest,
              ...mockCreatePaymentDto,
              status: Status.ACCEPTED,
            }),
            rejectPayment: jest.fn().mockReturnValue({
              ...mockRequest,
              ...mockCreatePaymentDto,
              status: Status.REJECTED,
            }),
          },
        },
        { provide: getModelToken("Payment"), useValue: {} },
        JwtService,
        ConfigService,
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    repository = module.get<PaymentsRepositoryService>(
      PaymentsRepositoryService
    );
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should return created payment ", async () => {
    expect(
      await service.createPayment(mockCreatePaymentDto, mockRequest.email)
    ).toEqual(
      expect.objectContaining<Payment>({
        email: expect.stringContaining("@") as string,
        amount: expect.any(Number) as number,
        currency: expect.stringMatching(/rub|usd|uah|gbp/) as Currency,
        status: expect.stringMatching(/accepted/) as Status,
      })
    );
  });

  it("should return payment by id", async () => {
    expect(await service.getPaymentById(mockMongooseId)).toEqual(
      expect.objectContaining<Payment>({
        email: expect.stringContaining("@") as string,
        amount: expect.any(Number) as number,
        currency: expect.stringMatching(/rub|usd|uah|gbp/) as Currency,
        status: expect.stringMatching(/accepted/) as Status,
      })
    );
  });

  it("should return refunded payment", async () => {
    expect(await service.refundPayment(mockMongooseId)).toEqual(
      expect.objectContaining<Payment>({
        email: expect.stringContaining("@") as string,
        amount: expect.any(Number) as number,
        currency: expect.stringMatching(/rub|usd|uah|gbp/) as Currency,
        status: expect.stringMatching(/rejected/) as Status,
      })
    );
  });

  it("should throw 400 if invalid id in getPaymentById", async () => {
    await expect(service.getPaymentById("invalidId")).rejects.toThrow(
      BadRequestException
    );
  });

  it("should throw 404 if payment not found in getPaymentById", async () => {
    jest.spyOn(repository, "getById").mockResolvedValue(null);

    await expect(service.getPaymentById(mockMongooseId)).rejects.toThrow(
      NotFoundException
    );
  });

  it("should throw 400 if invalid id in refundPayment", async () => {
    await expect(service.refundPayment("invalidId")).rejects.toThrow(
      BadRequestException
    );
  });

  it("should throw 404 if payment not found in refundPayment", async () => {
    jest.spyOn(repository, "rejectPayment").mockResolvedValue(null);

    await expect(service.refundPayment(mockMongooseId)).rejects.toThrow(
      NotFoundException
    );
  });
});
