import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { App } from "supertest/types";
import { AppModule } from "./../src/app.module";
import { Model } from "mongoose";
import cookieParser from "cookie-parser";
import { Response } from "express";
import { AuthGuard } from "../src/common/guards/auth.guard";
import { AuthMockGuard } from "../src/common/guards/auth-mock.guard";
import { Payment } from "../src/schemas/payment.schema";
import { CreatePaymentDto } from "../src/modules/payments/types/createPaymentDto";
import { Currency } from "../src/types/currency.enum";
import { Status } from "../src/types/status.enum";

type TestPaymentResponse = Response & {
  body: Payment & { _id: string };
};

const paymentDto: CreatePaymentDto = {
  amount: 1000,
  currency: Currency.RUB,
};

const expectedPaymentStructure = {
  email: expect.stringContaining("@") as string,
  amount: expect.any(Number) as number,
  currency: expect.stringMatching(/rub|usd|uah|gbp/) as Currency,
  status: expect.stringMatching(/accepted|pending|rejected/) as Status,
};

const checkCorrectPaymentStructure = (payment: Payment) => {
  expect(payment).toMatchObject(expectedPaymentStructure);
};

describe("PaymentsController (e2e", () => {
  let app: INestApplication<App>;
  let paymentModel: Model<Payment>;
  let testPaymentResponse: TestPaymentResponse;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(AuthGuard)
      .useClass(AuthMockGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    paymentModel = moduleFixture.get<Model<Payment>>("PaymentModel");

    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    app.setGlobalPrefix("api");
    await app.init();

    await paymentModel.deleteMany({});

    testPaymentResponse = (await request(app.getHttpServer())
      .post("/api/payments")
      .send(paymentDto)) as unknown as Response & {
      body: Payment & { _id: string };
    };
  });

  afterAll(async () => {
    await paymentModel.deleteMany({});
  });

  it("POST /api/payments - should return created payment", async () => {
    const response = (await request(app.getHttpServer())
      .post("/api/payments")
      .send(paymentDto)
      .expect(201)) as unknown as Response & { body: Payment };

    checkCorrectPaymentStructure(response.body);
  });

  it("GET /api/payments/:id - should return payment with correct id", async () => {
    const response = (await request(app.getHttpServer())
      .get(`/api/payments/${testPaymentResponse.body._id}`)
      .expect(200)) as unknown as Response & {
      body: Payment & { _id: string };
    };

    checkCorrectPaymentStructure(response.body);
    expect(response.body._id).toEqual(testPaymentResponse.body._id);
  });

  it("DELETE /api/payments/:id", async () => {
    const response = (await request(app.getHttpServer())
      .delete(`/api/payments/${testPaymentResponse.body._id}`)
      .expect(200)) as unknown as Response & {
      body: Payment & { _id: string };
    };

    checkCorrectPaymentStructure(response.body);
    expect(response.body._id).toEqual(testPaymentResponse.body._id);
  });
});
