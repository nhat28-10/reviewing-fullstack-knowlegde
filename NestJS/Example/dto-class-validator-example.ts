/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs class-validator class-transformer
    npm install -D typescript ts-node

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' dto-class-validator-example.ts

  Request hợp lệ:
    POST http://localhost:3000/products
    body: {"name":"Keyboard","supplierEmail":"shop@example.com","quantity":"3"}

  Request không hợp lệ (trả 400):
    POST http://localhost:3000/products
    body: {"name":"","supplierEmail":"not-an-email","quantity":-1,"isAdmin":true}
*/

import { Body, Controller, Injectable, Module, Post, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Type } from "class-transformer";
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

// DTO là class để metadata từ các decorator tồn tại ở runtime.
class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  supplierEmail!: string;

  // transform: true + @Type chuyển "3" trong JSON thành number 3 trước khi validate.
  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity!: number;

  @IsOptional()
  @IsString()
  description?: string;
}

type Product = CreateProductDto & { id: string };

@Injectable()
class ProductsService {
  private readonly products: Product[] = [];

  create(dto: CreateProductDto) {
    const product: Product = { id: String(this.products.length + 1), ...dto };
    this.products.push(product);
    return product;
  }
}

@Controller("products")
class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@Body() dto: CreateProductDto) {
    // Method này chỉ chạy khi dto đã vượt qua ValidationPipe.
    return this.productsService.create(dto);
  }
}

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3000);
  console.log("Server is running at http://localhost:3000");
}

void bootstrap();
