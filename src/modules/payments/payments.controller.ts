import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { CreatePaymentDto } from "./types/createPaymentDto";
import { RequestWithEmail } from "src/types/requestWithEmail.interface";

@UseGuards(AuthGuard)
@Controller("payments")
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  createPayment(
    @Body() payment: CreatePaymentDto,
    @Req() request: RequestWithEmail
  ) {
    return this.paymentsService.createPayment(payment, request);
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
