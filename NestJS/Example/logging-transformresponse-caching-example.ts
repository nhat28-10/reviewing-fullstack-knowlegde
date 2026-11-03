/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/cache-manager cache-manager reflect-metadata rxjs
    npm install -D typescript ts-node

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' logging-transformresponse-caching-example.ts

  Kiểm tra: gọi GET http://localhost:3000/products hai lần trong 10 giây.
  - Console vẫn ghi thời gian ở mỗi request.
  - productsServiceCalls chỉ tăng ở request đầu (cache miss).
  - Response luôn có dạng { data: ... }.
*/

import { CallHandler, Controller, ExecutionContext, Get, Injectable, Logger, Module, NestInterceptor, UseInterceptors } from "@nestjs/common";
import { CacheInterceptor, CacheModule } from "@nestjs/cache-manager";
import { NestFactory } from "@nestjs/core";
import { Observable } from "rxjs";
import { finalize, map } from "rxjs/operators";

@Injectable()
class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger("HTTP");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ method: string; url: string }>();
    const startedAt = Date.now();
    this.logger.log(`Before: ${request.method} ${request.url}`);

    return next.handle().pipe(
      finalize(() => this.logger.log(`Finished in ${Date.now() - startedAt}ms`)),
    );
  }
}

@Injectable()
class TransformResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<{ data: unknown }> {
    return next.handle().pipe(map((data) => ({ data })));
  }
}

@Injectable()
class ProductsService {
  private calls = 0;

  findAll() {
    this.calls += 1;
    return {
      productsServiceCalls: this.calls,
      products: [
        { id: 1, name: "Laptop" },
        { id: 2, name: "Mouse" },
      ],
    };
  }
}

@Controller("products")
class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /*
    Thứ tự khai báo giúp TransformResponseInterceptor bọc cả kết quả cache hit:
    Logging (ngoài) → Transform response → Cache (trong) → Controller.
  */
  @Get()
  @UseInterceptors(LoggingInterceptor, TransformResponseInterceptor, CacheInterceptor)
  findAll() {
    return this.productsService.findAll();
  }
}

@Module({
  imports: [CacheModule.register({ ttl: 10_000 })],
  controllers: [ProductsController],
  providers: [ProductsService, LoggingInterceptor, TransformResponseInterceptor],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log("Server is running at http://localhost:3000");
}

void bootstrap();
