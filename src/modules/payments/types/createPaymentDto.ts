import { IsNumber, IsString } from "class-validator";
import { Currency } from "../../../types/currency.enum";
import { Status } from "../../../types/status.enum";

export class CreatePaymentDto {
  @IsNumber()
  amount: number;

  @IsString()
  currency: Currency;

  @IsString()
  status: Status;
}
