/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs class-validator class-transformer
    npm install -D typescript ts-node

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' validationpipe-parseintpipe-transform-example.ts

  Thử các request:
    GET  http://localhost:3000/products/1       -> id là number
    GET  http://localhost:3000/products/abc     -> 400 từ ParseIntPipe
    POST http://localhost:3000/products
         body: {"name":"Laptop","quantity":"10"} -> quantity được chuyển thành number
    POST http://localhost:3000/products
         body: {"name":"","quantity":-1,"isAdmin":true} -> 400 từ ValidationPipe
*/

import { Body, Controller, Get, Injectable, Module, NotFoundException, Param, ParseIntPipe, Post, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Type } from "class-transformer";
import { IsInt, IsNotEmpty, IsString, Min } from "class-validator";

class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  quantity!: number;
}

type Product = CreateProductDto & { id: number };

@Injectable()
class ProductsService {
  private readonly products: Product[] = [{ id: 1, name: "Mouse", quantity: 5 }];

  findOne(id: number) {
    const product = this.products.find((item) => item.id === id);
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  create(dto: CreateProductDto) {
    const product: Product = { id: this.products.length + 1, ...dto };
    this.products.push(product);
    return { product, quantityType: typeof dto.quantity };
  }
}

@Controller("products")
class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    // Controller chỉ chạy sau khi ParseIntPipe chuyển và kiểm tra id.
    return { product: this.productsService.findOne(id), idType: typeof id };
  }

  @Post()
  create(@Body() dto: CreateProductDto) {
    // Controller chỉ chạy sau khi ValidationPipe transform + validate dto.
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
