import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { AuthGuard } from "../../common/guards/auth.guard";
import { CreatePaymentDto } from "./types/createPaymentDto";
import { RequestWithEmail } from "src/types/requestWithEmail.interface";
import { ObjectId } from "mongoose";

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

  @Get(":id")
  getPaymentById(@Param("id") id: ObjectId) {
    return this.paymentsService.getPaymentById(id);
  }

  @Post()
  refundPayment() {
    return this.paymentsService.refundPayment();
  }
}
