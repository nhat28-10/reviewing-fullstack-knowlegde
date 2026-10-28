/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
    npm install -D typescript ts-node

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' structuremodule-controller-service-datalayer-example.ts

  Kiểm tra:
    GET http://localhost:3000/users/1
    GET http://localhost:3000/users/999  -> 404

  Một file này chỉ dùng để học luồng kiến trúc. Khi làm dự án thật,
  hãy tách từng class vào users.module.ts, users.controller.ts,
  users.service.ts và users.repository.ts.
*/

import { Controller, Get, Injectable, Module, NotFoundException, Param } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

type User = {
  id: string;
  email: string;
  passwordHash: string;
};

// Data layer: chỉ phụ trách cách đọc/ghi dữ liệu.
@Injectable()
class UsersRepository {
  private readonly users: User[] = [
    { id: "1", email: "an@example.com", passwordHash: "hashed-password-1" },
    { id: "2", email: "binh@example.com", passwordHash: "hashed-password-2" },
  ];

  findById(id: string) {
    // Dự án dùng Prisma có thể thay bằng prisma.user.findUnique(...).
    return this.users.find((user) => user.id === id) ?? null;
  }
}

// Service: chứa quy tắc nghiệp vụ và không biết chi tiết HTTP.
@Injectable()
class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findById(id: string) {
    const user = this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    // Không để lộ password hash ra API.
    return { id: user.id, email: user.email };
  }
}

// Controller: nhận HTTP request, lấy parameter và gọi service.
@Controller("users")
class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(":id")
  findById(@Param("id") id: string) {
    return this.usersService.findById(id);
  }
}

// Module: khai báo các dependency NestJS cần tạo và kết nối.
@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
})
class UsersModule {}

@Module({
  imports: [UsersModule],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log("Server is running at http://localhost:3000");
}

void bootstrap();
