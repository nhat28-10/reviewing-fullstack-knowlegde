/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
    npm install -D typescript ts-node @types/express

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' exceptionfilter-httpexception-example.ts

  Thử các request:
    GET  http://localhost:3000/users/1      -> thành công
    GET  http://localhost:3000/users/999    -> 404 đã được filter định dạng
    POST http://localhost:3000/users        body: {"email":"an@example.com"} -> 409
*/

import { ArgumentsHost, Body, Catch, ConflictException, Controller, ExceptionFilter, Get, HttpException, Injectable, Module, NotFoundException, Param, Post } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { Request, Response } from "express";

type CreateUserDto = { email: string };

@Injectable()
class UsersService {
  private readonly users = [{ id: "1", email: "an@example.com" }];

  findOne(id: string) {
    const user = this.users.find((item) => item.id === id);
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  create(dto: CreateUserDto) {
    if (this.users.some((user) => user.email === dto.email)) {
      throw new ConflictException("Email already exists");
    }

    const user = { id: String(this.users.length + 1), email: dto.email };
    this.users.push(user);
    return user;
  }
}

@Catch(HttpException)
class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const exceptionResponse = exception.getResponse();
    const message =
      typeof exceptionResponse === "string"
        ? exceptionResponse
        : (exceptionResponse as { message?: string | string[] }).message ?? exception.message;

    response.status(exception.getStatus()).json({
      statusCode: exception.getStatus(),
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

@Controller("users")
class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}

@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Global filter chỉ bắt HttpException và các class kế thừa như NotFoundException.
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(3000);
  console.log("Server is running at http://localhost:3000");
}

void bootstrap();
