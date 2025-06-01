import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Product } from "./product.schema";
import { HydratedDocument } from "mongoose";

export type ProductDocument = HydratedDocument<Cart>;

@Schema()
export class Cart {
  @Prop({ required: true, unique: true })
  ownerEmail: string;

  @Prop({ type: () => [Product], required: false, default: [] })
  products: Product[];
}

export const CartSchema = SchemaFactory.createForClass(Cart);
