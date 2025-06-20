import { Controller, Get, Post } from "@nestjs/common";
import { PaymentsService } from "./payments.service";

@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  createPayment() {
    return this.paymentsService.createPayment();
  }

  @Get()
  getPaymentStatus() {
    return this.paymentsService.getPaymentStatus();
  }

  @Post()
  refundPayment() {
    return this.paymentsService.refundPayment();
  }
}
