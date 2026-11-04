/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs class-validator class-transformer
    npm install -D typescript ts-node @types/express

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' global-pipe-guard-interceptor-example.ts

  Thử các request:
    POST http://localhost:3000/auth/login
         body: {"email":"user@example.com"}  -> @Public() bỏ qua Global Guard
    GET  http://localhost:3000/users/profile
         Authorization: Bearer user-token
    POST http://localhost:3000/users
         Authorization: Bearer user-token
         body: {"name":"An","email":"an@example.com"} -> Global ValidationPipe validate

  Mọi response handler thông thường được Global Interceptor bọc thành { data: ... }.
*/

import { Body, CallHandler, CanActivate, Controller, createParamDecorator, ExecutionContext, Get, Injectable, Module, NestInterceptor, Post, SetMetadata, UnauthorizedException } from "@nestjs/common";
import { APP_GUARD, APP_INTERCEPTOR, APP_PIPE, NestFactory, Reflector } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import type { Request } from "express";

const IS_PUBLIC_KEY = "isPublic";
const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

type DemoUser = { id: string; email: string };
type RequestWithUser = Request & { user?: DemoUser };

class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;
}

const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  return context.switchToHttp().getRequest<RequestWithUser>().user;
});

@Injectable()
class DemoGlobalAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (request.headers.authorization !== "Bearer user-token") {
      throw new UnauthorizedException("Bearer user-token is required");
    }

    request.user = { id: "1", email: "user@example.com" };
    return true;
  }
}

@Injectable()
class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<{ data: unknown }> {
    return next.handle().pipe(map((data) => ({ data })));
  }
}

@Controller("auth")
class AuthController {
  @Post("login")
  @Public()
  login(@Body() body: { email: string }) {
    return { message: `Login route is public for ${body.email}` };
  }
}

@Controller("users")
class UsersController {
  private readonly users: CreateUserDto[] = [];

  @Get("profile")
  profile(@CurrentUser() user: DemoUser) {
    return user;
  }

  @Post()
  create(@Body() dto: CreateUserDto) {
    this.users.push(dto);
    return dto;
  }
}

@Module({
  controllers: [AuthController, UsersController],
  providers: [
    {
      provide: APP_PIPE,
      useFactory: () =>
        new ValidationPipe({
          transform: true,
          whitelist: true,
          forbidNonWhitelisted: true,
        }),
    },
    { provide: APP_GUARD, useClass: DemoGlobalAuthGuard },
    { provide: APP_INTERCEPTOR, useClass: ResponseEnvelopeInterceptor },
  ],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log("Server is running at http://localhost:3000");
}

void bootstrap();
