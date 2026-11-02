/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/jwt reflect-metadata rxjs
    npm install -D typescript ts-node @types/express

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' authentication-authorization-example.ts

  1. POST http://localhost:3000/auth/login
     body admin: {"email":"admin@example.com","password":"admin123"}
     body user:  {"email":"user@example.com","password":"user123"}
  2. Dùng accessToken nhận được:
     GET http://localhost:3000/users/profile
     Authorization: Bearer <accessToken>
  3. DELETE http://localhost:3000/users/2
     Chỉ token của admin được phép; token user nhận 403.

  Chỉ dùng để học: không hard-code secret hay lưu mật khẩu dạng plain text ở dự án thật.
*/

import { Body, CanActivate, Controller, Delete, ExecutionContext, Get, Injectable, Module, Post, Req, SetMetadata, UnauthorizedException, UseGuards } from "@nestjs/common";
import { JwtModule, JwtService } from "@nestjs/jwt";
import { NestFactory, Reflector } from "@nestjs/core";
import type { Request } from "express";

enum Role {
  USER = "USER",
  ADMIN = "ADMIN",
}

type JwtPayload = { sub: string; email: string; role: Role };
type RequestWithUser = Request & { user?: JwtPayload };
type LoginDto = { email: string; password: string };

const ROLES_KEY = "roles";
const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
class AuthService {
  // Demo only — production phải dùng password hash trong database.
  private readonly users = [
    { id: "1", email: "admin@example.com", password: "admin123", role: Role.ADMIN },
    { id: "2", email: "user@example.com", password: "user123", role: Role.USER },
  ];

  constructor(private readonly jwtService: JwtService) {}

  async login(dto: LoginDto) {
    const user = this.users.find((item) => item.email === dto.email && item.password === dto.password);
    if (!user) throw new UnauthorizedException("Invalid email or password");

    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role };
    return { accessToken: await this.jwtService.signAsync(payload) };
  }
}

@Injectable()
class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const authorization = request.headers.authorization;

    if (typeof authorization !== "string" || !authorization.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing bearer token");
    }

    try {
      request.user = await this.jwtService.verifyAsync<JwtPayload>(authorization.slice(7));
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}

@Injectable()
class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles?.length) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    return Boolean(request.user && requiredRoles.includes(request.user.role));
  }
}

@Controller("auth")
class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}

@Controller("users")
class UsersController {
  @Get("profile")
  @UseGuards(JwtAuthGuard)
  profile(@Req() request: RequestWithUser) {
    return request.user;
  }

  @Delete(":id")
  @Roles(Role.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  remove() {
    return { message: "Only an authenticated ADMIN can reach this controller method." };
  }
}

@Module({
  imports: [JwtModule.register({ secret: "learning-only-secret", signOptions: { expiresIn: "15m" } })],
  controllers: [AuthController, UsersController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
  console.log("Server is running at http://localhost:3000");
}

void bootstrap();
