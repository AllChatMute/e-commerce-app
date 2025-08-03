import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { CreatePaymentDto } from "./types/createPaymentDto";
import { PaymentsRepositoryService } from "src/services/paymentRepository.service";
import { Request } from "express";
import { Payment } from "../../schemas/payment.schema";

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentsRepositoryService: PaymentsRepositoryService
  ) {}

  async createPayment(
    payment: CreatePaymentDto,
    request: Request & { email: string }
  ): Promise<Payment> {
    const createdPayment = await this.paymentsRepositoryService.create({
      ...payment,
      email: request.email,
    });

    if (!createdPayment)
      throw new InternalServerErrorException("Failed to create payment");

    return createdPayment;
  }

  async getPaymentStatus() {}

  async refundPayment() {}
}
