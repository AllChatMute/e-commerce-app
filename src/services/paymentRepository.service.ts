import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Payment } from "../schemas/payment.schema";
import { Model } from "mongoose";

@Injectable()
export class PaymentsRepositoryService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<Payment>
  ) {}

  async create(payment: Payment): Promise<Payment | null> {
    return this.paymentModel.insertOne(payment);
  }
}
