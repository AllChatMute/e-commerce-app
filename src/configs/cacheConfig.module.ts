import { createKeyv } from "@keyv/redis";
import { CacheModule } from "@nestjs/cache-manager";
import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        stores: [createKeyv(configService.get("REDIS_URL"))],
        ttl: 2 * 60 * 60 * 1000,
      }),
      inject: [ConfigService],
    }),
  ],
  exports: [CacheModule],
})
export class CacheConfigModule {}
