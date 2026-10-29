/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
    npm install -D typescript ts-node

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' controller-routedecorators-example.ts

  Kiểm tra:
    GET    http://localhost:3000/products
    GET    http://localhost:3000/products/featured
    GET    http://localhost:3000/products/1
    POST   http://localhost:3000/products        body: {"name":"Keyboard","price":700}
    PATCH  http://localhost:3000/products/1      body: {"price":1200}
    PUT    http://localhost:3000/products/1      body: {"name":"Laptop Pro","price":2000}
    DELETE http://localhost:3000/products/1

  File dùng dữ liệu trong bộ nhớ để tập trung vào Controller và route decorators.
*/

import { Body, Controller, Delete, Get, Injectable, Module, NotFoundException, Param, Patch, Post, Put } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

type Product = { id: string; name: string; price: number; featured?: boolean };
type CreateProductDto = { name: string; price: number };
type UpdateProductDto = Partial<CreateProductDto>;

@Injectable()
class ProductsService {
  private products: Product[] = [
    { id: "1", name: "Laptop", price: 1500, featured: true },
    { id: "2", name: "Mouse", price: 30 },
  ];

  findAll() {
    return this.products;
  }

  findFeatured() {
    return this.products.filter((product) => product.featured);
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

  replace(id: string, data: CreateProductDto) {
    this.findOne(id);
    const product = { id, ...data };
    this.products = this.products.map((item) => (item.id === id ? product : item));
    return product;
  }

  update(id: string, data: UpdateProductDto) {
    const product = this.findOne(id);
    Object.assign(product, data);
    return product;
  }

  remove(id: string) {
    const product = this.findOne(id);
    this.products = this.products.filter((item) => item.id !== id);
    return { message: "Product deleted", product };
  }
}

@Controller("products") // Prefix chung: /products
class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get() // GET /products
  findAll() {
    return this.productsService.findAll();
  }

  // Route tĩnh đặt trước route động :id.
  @Get("featured") // GET /products/featured
  findFeatured() {
    return this.productsService.findFeatured();
  }

  @Get(":id") // GET /products/:id
  findOne(@Param("id") id: string) {
    return this.productsService.findOne(id);
  }

  @Post() // POST /products
  create(@Body() data: CreateProductDto) {
    return this.productsService.create(data);
  }

  @Put(":id") // PUT /products/:id
  replace(@Param("id") id: string, @Body() data: CreateProductDto) {
    return this.productsService.replace(id, data);
  }

  @Patch(":id") // PATCH /products/:id
  update(@Param("id") id: string, @Body() data: UpdateProductDto) {
    return this.productsService.update(id, data);
  }

  @Delete(":id") // DELETE /products/:id
  remove(@Param("id") id: string) {
    return this.productsService.remove(id);
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
