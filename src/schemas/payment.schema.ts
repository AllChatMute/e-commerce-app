import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Currency } from "../types/currency.enum";

export type PaymentDocument = HydratedDocument<Payment>;

@Schema()
export class Payment {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true, min: 1 })
  amount: number;

  @Prop({ required: true })
  currency: Currency;

  @Prop({ required: true })
  status: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
