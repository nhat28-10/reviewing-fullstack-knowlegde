/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
    npm install -D typescript ts-node

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' module-imports-controllers-providers-exports-example.ts

  Kiểm tra:
    GET http://localhost:3000/orders/preview/1
    GET http://localhost:3000/orders/preview/999  -> 404

  File này gom các class để dễ học. Dự án thật nên tách chúng thành
  users/ và orders/, mỗi module có file controller/service/module riêng.
*/

import { Controller, Get, Injectable, Module, NotFoundException, Param } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

// Provider thuộc UsersModule.
@Injectable()
class UsersService {
  private readonly users = [
    { id: "1", name: "An" },
    { id: "2", name: "Binh" },
  ];

  findById(id: string) {
    return this.users.find((user) => user.id === id) ?? null;
  }
}

// exports cho phép module import UsersModule inject UsersService.
@Module({
  providers: [UsersService],
  exports: [UsersService],
})
class UsersModule {}

// Provider thuộc OrdersModule, dùng một provider được export bởi UsersModule.
@Injectable()
class OrdersService {
  constructor(private readonly usersService: UsersService) {}

  previewForUser(userId: string) {
    const user = this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return {
      message: "OrdersService dùng được UsersService qua imports/exports.",
      user,
      draftOrder: { productName: "NestJS course", quantity: 1 },
    };
  }
}

// Controller phải được đăng ký trong controllers của chính module nó thuộc về.
@Controller("orders")
class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get("preview/:userId")
  preview(@Param("userId") userId: string) {
    return this.ordersService.previewForUser(userId);
  }
}

/*
  imports: lấy các provider được UsersModule export.
  controllers: đăng ký HTTP controller của OrdersModule.
  providers: đăng ký dependency do OrdersModule sở hữu.
*/
@Module({
  imports: [UsersModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
class OrdersModule {}

@Module({
  imports: [OrdersModule],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log("Server is running at http://localhost:3000");
}

void bootstrap();
