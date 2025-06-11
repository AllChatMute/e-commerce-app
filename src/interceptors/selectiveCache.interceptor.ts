import { CacheInterceptor } from "@nestjs/cache-manager";
import { ExecutionContext, Injectable } from "@nestjs/common";
import { Request } from "express";

@Injectable()
export class SelectiveCacheInterceptor extends CacheInterceptor {
  protected isRequestCacheable(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (Object.keys(request.query).length > 0) {
      return false;
    }

    return super.isRequestCacheable(context);
  }
}
