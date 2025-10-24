import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
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

  @Get(":id")
  getPaymentById(@Param("id") id: string) {
    return this.paymentsService.getPaymentById(id);
  }

  @HttpCode(HttpStatus.OK)
  @Delete(":id")
  refundPayment(@Param("id") id: string) {
    return this.paymentsService.refundPayment(id);
  }
}
