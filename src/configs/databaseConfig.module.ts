import { Global, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "../schemas/user.schema";
import { Product, ProductSchema } from "../schemas/product.schema";
import { Cart, CartSchema } from "../schemas/cart.schema";
import { Payment, PaymentSchema } from "../schemas/payment.schema";

@Global()
@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>("DATABASE_URL"),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Product.name, schema: ProductSchema },
      { name: Cart.name, schema: CartSchema },
      { name: Payment.name, schema: PaymentSchema },
    ]),
  ],
  exports: [MongooseModule],
})
export class DatabaseConfigModule {}
