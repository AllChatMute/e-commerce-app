import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";

export type ProductDocument = HydratedDocument<Product>;

@Schema()
export class Product {
  @Prop({ required: true })
  productId: number;

  @Prop({ required: true, minlength: 1 })
  name: string;

  @Prop({ required: false, default: "" })
  description?: string;

  @Prop({ required: true, min: 1 })
  price: number;

  @Prop({ required: false, default: [] })
  categories?: string[];

  @Prop({ required: false })
  count?: number;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
