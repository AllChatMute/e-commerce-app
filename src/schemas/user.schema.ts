import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument } from "mongoose";
import { Role } from "../types/role.enum";

const regex =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, match: regex })
  email: string;

  @Prop({ required: true, minlength: 8 })
  password: string;

  @Prop({ required: false, default: ["user"] })
  roles: Role[];
}

export const UserSchema = SchemaFactory.createForClass(User);
