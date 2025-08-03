import { Module } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import { PaymentsController } from "./payments.controller";
import { PaymentsRepositoryService } from "../../services/paymentRepository.service";

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService, PaymentsRepositoryService],
})
export class PaymentsModule {}
