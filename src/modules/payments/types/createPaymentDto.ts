import { IsNumber, IsEnum } from "class-validator";
import { Currency } from "../../../types/currency.enum";

export class CreatePaymentDto {
  @IsNumber()
  amount: number;

  @IsEnum(Currency)
  currency: Currency;
}
