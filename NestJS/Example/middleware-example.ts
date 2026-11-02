/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
    npm install -D typescript ts-node @types/express

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' middleware-example.ts

  Kiểm tra: GET http://localhost:3000/users
  Console sẽ ghi request; response có header x-request-id.
*/

import { Controller, Get, Injectable, Logger, MiddlewareConsumer, Module, NestMiddleware, NestModule, Req } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NextFunction, Request, Response } from "express";

type RequestWithId = Request & { requestId?: string };

@Injectable()
class RequestLogService {
  private readonly logger = new Logger("HTTP");

  log(message: string) {
    this.logger.log(message);
  }
}

@Injectable()
class RequestIdLoggerMiddleware implements NestMiddleware {
  // Middleware có thể nhận provider qua DI như Service thông thường.
  constructor(private readonly requestLogService: RequestLogService) {}

  use(req: RequestWithId, res: Response, next: NextFunction) {
    const requestId = `req-${Date.now()}`;
    req.requestId = requestId;
    res.setHeader("x-request-id", requestId);
    this.requestLogService.log(`${requestId} ${req.method} ${req.originalUrl}`);

    // Không gọi next() và không gửi response sẽ làm request bị treo.
    next();
  }
}

@Controller("users")
class UsersController {
  @Get()
  findAll(@Req() req: RequestWithId) {
    return {
      requestId: req.requestId,
      users: ["An", "Binh"],
    };
  }
}

@Module({
  controllers: [UsersController],
  providers: [RequestLogService],
})
class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Chỉ áp dụng middleware cho route của UsersController.
    consumer.apply(RequestIdLoggerMiddleware).forRoutes(UsersController);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log("Server is running at http://localhost:3000");
}

void bootstrap();
