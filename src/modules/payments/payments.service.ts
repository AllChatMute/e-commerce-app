import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { CreatePaymentDto } from "./types/createPaymentDto";
import { PaymentsRepositoryService } from "../../services/paymentRepository.service";
import { Request } from "express";
import { Payment } from "../../schemas/payment.schema";
import { Status } from "../../types/status.enum";
import { isValidObjectId } from "mongoose";

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
      status: Status.ACCEPTED,
      email: request.email,
    });

    if (!createdPayment)
      throw new InternalServerErrorException("Failed to create payment");

    return createdPayment;
  }

  async getPaymentById(id: string): Promise<Payment | null> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Invalid id");
    }
    const foundedPayment = await this.paymentsRepositoryService.getById(id);

    if (!foundedPayment) throw new NotFoundException();

    return foundedPayment;
  }

  async refundPayment(id: string): Promise<Payment | null> {
    if (!isValidObjectId(id)) {
      throw new BadRequestException("Invalid id");
    }

    const rejectedPayment =
      await this.paymentsRepositoryService.rejectPayment(id);

    if (!rejectedPayment) throw new NotFoundException();

    return rejectedPayment;
  }
}
