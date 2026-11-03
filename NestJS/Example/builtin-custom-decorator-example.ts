/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
    npm install -D typescript ts-node @types/express

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' builtin-custom-decorator-example.ts

  Thử các request:
    GET http://localhost:3000/users/profile
    Authorization: Bearer user-token

    GET http://localhost:3000/admin/dashboard
    Authorization: Bearer admin-token  -> thành công
    Authorization: Bearer user-token   -> 403

  Token tĩnh chỉ phục vụ việc học custom decorator và Guard.
*/

import { CanActivate, Controller, createParamDecorator, ExecutionContext, ForbiddenException, Get, Injectable, Module, SetMetadata, UnauthorizedException, UseGuards } from "@nestjs/common";
import { NestFactory, Reflector } from "@nestjs/core";
import type { Request } from "express";

enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

type DemoUser = { id: string; email: string; role: Role };
type RequestWithUser = Request & { user?: DemoUser };

const ROLES_KEY = "roles";

// Custom metadata decorator: chỉ khai báo role yêu cầu, không tự kiểm tra quyền.
const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

// Custom parameter decorator: lấy user hoặc một property user đã có trên request.
const CurrentUser = createParamDecorator(
  (data: keyof DemoUser | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return data ? request.user?.[data] : request.user;
  },
);

@Injectable()
class DemoAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authorization = request.headers.authorization;
    const usersByToken: Record<string, DemoUser> = {
      "admin-token": { id: "1", email: "admin@example.com", role: Role.ADMIN },
      "user-token": { id: "2", email: "user@example.com", role: Role.USER },
    };

    if (typeof authorization !== "string" || !authorization.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }

    const user = usersByToken[authorization.slice(7)];
    if (!user) throw new UnauthorizedException("Invalid token");

    request.user = user;
    return true;
  }
}

@Injectable()
class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!roles?.length) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    if (!request.user || !roles.includes(request.user.role)) {
      throw new ForbiddenException("Insufficient role");
    }
    return true;
  }
}

@Controller("users") // Built-in class decorator
class UsersController {
  @Get("profile") // Built-in route decorator
  @UseGuards(DemoAuthGuard) // Built-in Guard decorator
  profile(
    @CurrentUser() user: DemoUser, // Custom parameter decorator
    @CurrentUser("email") email: string, // Lấy riêng một property
  ) {
    return { user, email };
  }
}

@Controller("admin")
class AdminController {
  @Get("dashboard")
  @Roles(Role.ADMIN) // Custom metadata decorator
  @UseGuards(DemoAuthGuard, RolesGuard)
  dashboard() {
    return { message: "Admin dashboard" };
  }
}

@Module({
  controllers: [UsersController, AdminController],
  providers: [DemoAuthGuard, RolesGuard],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log("Server is running at http://localhost:3000");
}

void bootstrap();
