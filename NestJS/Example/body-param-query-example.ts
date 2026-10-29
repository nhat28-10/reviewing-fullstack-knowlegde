/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
    npm install -D typescript ts-node

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' body-param-query-example.ts

  Thử các request:
    GET   http://localhost:3000/products?category=computer&keyword=lap
    GET   http://localhost:3000/products/1
    POST  http://localhost:3000/products
          body: {"name":"Keyboard","category":"accessory","price":70}
    PATCH http://localhost:3000/products/1?notify=true
          body: {"price":1200}

  File dùng dữ liệu trong bộ nhớ, mục tiêu là thấy nguồn dữ liệu của @Query,
  @Param và @Body trong Controller.
*/

import { Body, Controller, Get, Injectable, Module, NotFoundException, Param, Patch, Post, Query } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

type Product = { id: string; name: string; category: string; price: number };
type CreateProductDto = Omit<Product, "id">;
type UpdateProductDto = Partial<CreateProductDto>;

@Injectable()
class ProductsService {
  private products: Product[] = [
    { id: "1", name: "Laptop", category: "computer", price: 1500 },
    { id: "2", name: "Mouse", category: "accessory", price: 30 },
  ];

  findAll(category?: string, keyword?: string) {
    return this.products.filter((product) => {
      const matchesCategory = !category || product.category === category;
      const matchesKeyword = !keyword || product.name.toLowerCase().includes(keyword.toLowerCase());
      return matchesCategory && matchesKeyword;
    });
  }

  findOne(id: string) {
    const product = this.products.find((item) => item.id === id);
    if (!product) throw new NotFoundException("Product not found");
    return product;
  }

  create(data: CreateProductDto) {
    const product = { id: String(this.products.length + 1), ...data };
    this.products.push(product);
    return product;
  }

  update(id: string, data: UpdateProductDto) {
    const product = this.findOne(id);
    Object.assign(product, data);
    return product;
  }
}

@Controller("products")
class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  // GET /products?category=computer&keyword=lap
  @Get()
  findAll(
    @Query("category") category?: string,
    @Query("keyword") keyword?: string,
  ) {
    return this.productsService.findAll(category, keyword);
  }

  // GET /products/1 — id luôn là string nếu chưa dùng Pipe để chuyển kiểu.
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(id);
  }

  // POST /products với JSON body.
  @Post()
  create(@Body() data: CreateProductDto) {
    return this.productsService.create(data);
  }

  // PATCH /products/1?notify=true với JSON body.
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Query("notify") notify: string | undefined,
    @Body() data: UpdateProductDto,
  ) {
    const product = this.productsService.update(id, data);

    return {
      product,
      // Query string "true" vẫn là string; chỉ so sánh để minh hoạ.
      notificationRequested: notify === "true",
    };
  }
}

@Module({
  controllers: [ProductsController],
  providers: [ProductsService],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log("Server is running at http://localhost:3000");
}

void bootstrap();
