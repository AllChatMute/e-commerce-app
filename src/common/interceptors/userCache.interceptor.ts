import { CACHE_KEY_METADATA, CacheInterceptor } from "@nestjs/cache-manager";
import { ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class UserCacheInterceptor extends CacheInterceptor {
  protected trackBy(context: ExecutionContext): string | undefined {
    const request = context
      .switchToHttp()
      .getRequest<Request & { email: string }>();

    const email = request.email;
    const cacheKey: string = this.reflector.get(
      CACHE_KEY_METADATA,
      context.getHandler()
    );

    if (!cacheKey || !email) {
      return super.trackBy(context);
    }

    return `${email}${cacheKey}`;
  }
}
