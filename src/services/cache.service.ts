import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";

//TODO: Add getAllKeys function
@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async delete(key: string) {
    await this.cacheManager.del(key);
  }

  async clearProductsCache() {
    console.log(this.cacheManager.stores[0]);
  }
}
