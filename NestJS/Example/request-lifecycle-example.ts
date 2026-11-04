/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express reflect-metadata rxjs
    npm install -D typescript ts-node @types/express

  Chạy:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' request-lifecycle-example.ts

  Thử các request:
    GET http://localhost:3000/users/1   -> xem console: 1 → 7
    GET http://localhost:3000/users/abc -> Pipe ném 400; Controller và Service không chạy
*/

import { ArgumentsHost, BadRequestException, CallHandler, CanActivate, Catch, Controller, ExceptionFilter, ExecutionContext, Get, Injectable, MiddlewareConsumer, Module, NestInterceptor, NestMiddleware, NestModule, Param, PipeTransform, Req, UseGuards, UseInterceptors } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import type { NextFunction, Request, Response } from "express";

type RequestWithTrace = Request & { trace?: string[] };

@Injectable()
class TraceMiddleware implements NestMiddleware {
  use(request: RequestWithTrace, _response: Response, next: NextFunction) {
    console.log("1. Middleware");
    request.trace = ["middleware"];
    next();
  }
}

@Injectable()
class TraceGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    console.log("2. Guard");
    context.switchToHttp().getRequest<RequestWithTrace>().trace?.push("guard");
    return true;
  }
}

@Injectable()
class TraceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    console.log("3. Interceptor before");
    const request = context.switchToHttp().getRequest<RequestWithTrace>();
    request.trace?.push("interceptor-before");

    return next.handle().pipe(
      map((data) => {
        console.log("7. Interceptor after");
        return { ...data, trace: [...(request.trace ?? []), "interceptor-after"] };
      }),
    );
  }
}

@Injectable()
class TraceParseIntPipe implements PipeTransform<string, number> {
  transform(value: string) {
    console.log("4. Pipe");
    const id = Number(value);
    if (!Number.isInteger(id)) throw new BadRequestException("id must be an integer");
    return id;
  }
}

@Injectable()
class UsersService {
  findOne(id: number) {
    console.log("6. Service");
    return { id, name: "An" };
  }
}

@Catch(BadRequestException)
class BadRequestFilter implements ExceptionFilter {
  catch(exception: BadRequestException, host: ArgumentsHost) {
    console.log("Exception Filter");
    const context = host.switchToHttp();
    const request = context.getRequest<RequestWithTrace>();
    const response = context.getResponse<Response>();

    response.status(exception.getStatus()).json({
      statusCode: exception.getStatus(),
      message: exception.message,
      traceBeforeError: request.trace,
    });
  }
}

@Controller("users")
class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(":id")
  @UseGuards(TraceGuard)
  @UseInterceptors(TraceInterceptor)
  findOne(
    @Param("id", TraceParseIntPipe) id: number,
    @Req() request: RequestWithTrace,
  ) {
    console.log("5. Controller");
    request.trace?.push("controller");
    return this.usersService.findOne(id);
  }
}

@Module({
  controllers: [UsersController],
  providers: [UsersService, TraceGuard, TraceInterceptor, TraceParseIntPipe],
})
class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TraceMiddleware).forRoutes(UsersController);
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new BadRequestFilter());
  await app.listen(3000);
  console.log("Server is running at http://localhost:3000");
}

void bootstrap();
