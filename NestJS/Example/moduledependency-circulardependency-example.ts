/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
    npm install -D typescript ts-node

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' moduledependency-circulardependency-example.ts

  Kiểm tra: GET http://localhost:3000/users/1/family

  File gom các class để dễ học. Trong dự án thật, hãy ưu tiên tách nghiệp vụ
  chung (ví dụ MembershipService) thay vì tạo vòng UsersService ↔ FamiliesService.
*/

import { Controller, forwardRef, Get, Inject, Injectable, Module, Param } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

const USERS_SERVICE = Symbol("USERS_SERVICE");
const FAMILIES_SERVICE = Symbol("FAMILIES_SERVICE");

interface UsersServiceContract {
  getDisplayName(userId: string): string;
  getUserWithFamily(userId: string): { userId: string; name: string; family: string };
}

interface FamiliesServiceContract {
  getDefaultFamilyFor(userId: string): string;
}

@Injectable()
class UsersService implements UsersServiceContract {
  /*
    Provider circular dependency:
    UsersService cần FamiliesService, còn FamiliesService cũng cần UsersService.
    Token + forwardRef tránh tham chiếu class sớm trong file ví dụ một-file này.
  */
  constructor(
    @Inject(forwardRef(() => FAMILIES_SERVICE))
    private readonly familiesService: FamiliesServiceContract,
  ) {}

  getDisplayName(userId: string) {
    return userId === "1" ? "An" : "Unknown user";
  }

  getUserWithFamily(userId: string) {
    return {
      userId,
      name: this.getDisplayName(userId),
      family: this.familiesService.getDefaultFamilyFor(userId),
    };
  }
}

@Injectable()
class FamiliesService implements FamiliesServiceContract {
  constructor(
    @Inject(forwardRef(() => USERS_SERVICE))
    private readonly usersService: UsersServiceContract,
  ) {}

  getDefaultFamilyFor(userId: string) {
    // Gọi UsersService nhưng không gọi ngược lại getUserWithFamily(), nên không đệ quy vô hạn.
    return `${this.usersService.getDisplayName(userId)}'s family`;
  }
}

@Controller("users")
class UsersController {
  constructor(
    @Inject(USERS_SERVICE) private readonly usersService: UsersServiceContract,
  ) {}

  @Get(":id/family")
  getFamily(@Param("id") id: string) {
    return this.usersService.getUserWithFamily(id);
  }
}

@Module({
  // Module circular dependency: forwardRef cần có ở cả hai phía.
  imports: [forwardRef(() => FamiliesModule)],
  controllers: [UsersController],
  providers: [
    UsersService,
    { provide: USERS_SERVICE, useExisting: UsersService },
  ],
  exports: [USERS_SERVICE],
})
class UsersModule {}

@Module({
  imports: [forwardRef(() => UsersModule)],
  providers: [
    FamiliesService,
    { provide: FAMILIES_SERVICE, useExisting: FamiliesService },
  ],
  exports: [FAMILIES_SERVICE],
})
class FamiliesModule {}

@Module({
  imports: [UsersModule, FamiliesModule],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log("Server is running at http://localhost:3000");
}

void bootstrap();
