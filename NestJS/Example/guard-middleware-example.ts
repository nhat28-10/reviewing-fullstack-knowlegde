/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
    npm install -D typescript ts-node @types/express

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' guard-middleware-example.ts

  Thử các request:
    GET http://localhost:3000/reports/private
        -> Middleware chạy rồi Guard trả 401.
    GET http://localhost:3000/reports/private  với header x-api-key: learning-key
        -> Middleware → Guard → Controller; response có requestId và trace.

  API key tĩnh chỉ nhằm minh hoạ Guard. Dự án thật dùng JWT/session/API key an toàn.
*/

import { CanActivate, Controller, ExecutionContext, Get, Injectable, Logger, MiddlewareConsumer, Module, NestMiddleware, NestModule, Req, UnauthorizedException, UseGuards } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NextFunction, Request, Response } from "express";

type RequestWithContext = Request & { requestId?: string; trace?: string[] };

@Injectable()
class RequestLogService {
  private readonly logger = new Logger("Request");

  log(message: string) {
    this.logger.log(message);
  }
}

@Injectable()
class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly requestLogService: RequestLogService) {}

  use(req: RequestWithContext, res: Response, next: NextFunction) {
    req.requestId = `req-${Date.now()}`;
    req.trace = ["middleware"];
    res.setHeader("x-request-id", req.requestId);
    this.requestLogService.log(`${req.requestId} ${req.method} ${req.originalUrl}`);
    next(); // Cho phép Guard được thực thi tiếp theo.
  }
}

@Injectable()
class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithContext>();
    request.trace?.push("guard");

    if (request.headers["x-api-key"] !== "learning-key") {
      throw new UnauthorizedException("Missing or invalid x-api-key");
    }

    return true; // Controller chỉ được gọi sau khi Guard trả true.
  }
}

@Controller("reports")
class ReportsController {
  @Get("private")
  @UseGuards(ApiKeyGuard)
  getPrivateReport(@Req() request: RequestWithContext) {
    request.trace?.push("controller");
    return {
      requestId: request.requestId,
      trace: request.trace,
      report: "Private report data",
    };
  }
}

@Module({
  controllers: [ReportsController],
  providers: [RequestLogService, ApiKeyGuard],
})
class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes(ReportsController);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log("Server is running at http://localhost:3000");
}

void bootstrap();
