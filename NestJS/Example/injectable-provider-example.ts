/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
    npm install -D typescript ts-node

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' injectable-provider-example.ts

  Kiểm tra: GET http://localhost:3000/quotes

  File này minh hoạ ba loại provider phổ biến: class, value và factory.
*/

import { Controller, Get, Inject, Injectable, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

const APP_NAME = "APP_NAME";
const REQUEST_PREFIX = "REQUEST_PREFIX";

// Class provider: @Injectable() cho phép NestJS tạo và quản lý instance này.
@Injectable()
class QuotesService {
  constructor(@Inject(REQUEST_PREFIX) private readonly requestPrefix: string) {}

  getDailyQuote() {
    return {
      requestId: `${this.requestPrefix}${Date.now()}`,
      quote: "Small, clear modules make NestJS applications easier to maintain.",
    };
  }
}

@Controller("quotes")
class QuotesController {
  // Không dùng new QuotesService(...); NestJS inject provider vào constructor.
  constructor(
    private readonly quotesService: QuotesService,
    @Inject(APP_NAME) private readonly appName: string,
  ) {}

  @Get()
  getDailyQuote() {
    return { appName: this.appName, ...this.quotesService.getDailyQuote() };
  }
}

@Module({
  controllers: [QuotesController],
  providers: [
    QuotesService,
    // Value provider: dùng một giá trị có sẵn với token APP_NAME.
    { provide: APP_NAME, useValue: "NestJS Learning API" },
    // Factory provider: NestJS gọi factory và inject APP_NAME vào tham số appName.
    {
      provide: REQUEST_PREFIX,
      useFactory: (appName: string) => `${appName.toLowerCase().split(" ").join("-")}-`,
      inject: [APP_NAME],
    },
  ],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log("Server is running at http://localhost:3000");
}

void bootstrap();
