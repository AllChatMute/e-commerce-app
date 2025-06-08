import { Module } from "@nestjs/common";

import { AuthModule } from "./modules/auth/auth.module";
import { ConfigModule } from "@nestjs/config";
import { DatabaseConfigModule } from "./configs/databaseConfig.module";
import { ProductsModule } from "./modules/products/products.module";
import { CartModule } from "./modules/cart/cart.module";
import { CacheConfigModule } from "./configs/cacheConfig.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),
    DatabaseConfigModule,
    CacheConfigModule,
    AuthModule,
    ProductsModule,
    CartModule,
  ],
})
export class AppModule {}
