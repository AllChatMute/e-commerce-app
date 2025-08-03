import { IsNumber, IsString } from "class-validator";
import { Currency } from "../../../types/currency.enum";

export class CreatePaymentDto {
  @IsNumber()
  amount: number;

  @IsString()
  currency: Currency;
}
