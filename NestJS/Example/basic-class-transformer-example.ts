/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs class-validator class-transformer
    npm install -D typescript ts-node

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' basic-class-transformer-example.ts

  Kiểm tra:
    POST http://localhost:3000/products
    body: {"name":"   Laptop   ","quantity":"10"}

  Response cho thấy name là "Laptop" và quantity là number 10.
*/

import { Body, Controller, Module, Post, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Transform, Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

class CreateProductDto {
  // Quy tắc tùy chỉnh: bỏ khoảng trắng đầu/cuối.
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  name!: string;

  // Quy tắc theo kiểu: "10" từ HTTP request trở thành number 10.
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity!: number;
}

@Controller("products")
class ProductsController {
  @Post()
  create(@Body() dto: CreateProductDto) {
    return {
      product: dto,
      // Các field này giúp quan sát kết quả transformation.
      isDtoInstance: dto instanceof CreateProductDto,
      nameLength: dto.name.length,
      quantityType: typeof dto.quantity,
    };
  }
}

@Module({
  controllers: [ProductsController],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  await app.listen(3000);
  console.log("Server is running at http://localhost:3000");
}

void bootstrap();
