/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
    npm install -D typescript ts-node

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' whatisdependencyinjection-example.ts

  Kiểm tra:
    POST http://localhost:3000/orders/1
    body: {"productName":"NestJS course","amount":99}

  Mục tiêu: OrdersService không dùng new UsersService() hoặc new PaymentGateway().
  NestJS tạo và inject các dependency đó qua constructor.
*/

import { Body, Controller, Inject, Injectable, Module, NotFoundException, Param, Post } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

const PAYMENT_GATEWAY = "PAYMENT_GATEWAY";

type CreateOrderDto = { productName: string; amount: number };

interface PaymentGateway {
  charge(amount: number): { transactionId: string; status: "paid" };
}

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

// Fake implementation để ví dụ chạy không cần gọi cổng thanh toán thật.
class FakePaymentGateway implements PaymentGateway {
  charge(amount: number) {
    return { transactionId: `fake-${amount}-${Date.now()}`, status: "paid" as const };
  }
}

@Injectable()
class OrdersService {
  /*
    DI qua constructor:
    - UsersService là class provider.
    - PAYMENT_GATEWAY là token cho PaymentGateway.
    OrdersService không quyết định cách tạo hai dependency này.
  */
  constructor(
    private readonly usersService: UsersService,
    @Inject(PAYMENT_GATEWAY) private readonly paymentGateway: PaymentGateway,
  ) {}

  create(userId: string, data: CreateOrderDto) {
    const user = this.usersService.findById(userId);
    if (!user) throw new NotFoundException("User not found");

    const payment = this.paymentGateway.charge(data.amount);
    return { user, productName: data.productName, amount: data.amount, payment };
  }
}

@Controller("orders")
class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post(":userId")
  create(@Param("userId") userId: string, @Body() data: CreateOrderDto) {
    return this.ordersService.create(userId, data);
  }
}

@Module({
  controllers: [OrdersController],
  providers: [
    UsersService,
    OrdersService,
    // Thay FakePaymentGateway bằng provider thật hoặc mock test mà không sửa OrdersService.
    { provide: PAYMENT_GATEWAY, useValue: new FakePaymentGateway() },
  ],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log("Server is running at http://localhost:3000");
}

void bootstrap();
