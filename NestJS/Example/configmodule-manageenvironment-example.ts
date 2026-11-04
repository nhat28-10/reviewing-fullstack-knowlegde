/*
  Cài một lần trong thư mục dự án NestJS:
    npm install @nestjs/common @nestjs/core @nestjs/platform-express @nestjs/config reflect-metadata rxjs
    npm install -D typescript ts-node

  Chạy với giá trị mặc định:
    npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' configmodule-manageenvironment-example.ts

  Chạy PowerShell với environment variables:
    $env:PORT=4000; $env:APP_NAME="Learning API"; npx ts-node --compiler-options '{"experimentalDecorators":true,"emitDecoratorMetadata":true,"module":"commonjs"}' configmodule-manageenvironment-example.ts

  Để dùng file .env, bỏ ignoreEnvFile: true bên dưới rồi tạo .env:
    PORT=3000
    APP_NAME=NestJS Config Demo
    JWT_SECRET=local-development-only-secret

  Không trả JWT_SECRET về API; ví dụ chỉ trả trạng thái cấu hình secret.
*/

import { Controller, Get, Injectable, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";

type AppConfig = {
  PORT: number;
  APP_NAME: string;
  NODE_ENV: string;
  JWT_SECRET?: string;
};

@Injectable()
class AppInfoService {
  constructor(private readonly configService: ConfigService<AppConfig>) {}

  getPublicConfig() {
    return {
      appName: this.configService.get<string>("APP_NAME", "NestJS Config Demo"),
      port: this.configService.get<number>("PORT", 3000),
      nodeEnv: this.configService.get<string>("NODE_ENV", "development"),
      jwtSecretConfigured: Boolean(this.configService.get<string>("JWT_SECRET")),
    };
  }
}

@Controller("config")
class ConfigController {
  constructor(private readonly appInfoService: AppInfoService) {}

  @Get()
  getConfig() {
    return this.appInfoService.getPublicConfig();
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Giữ file ví dụ tự chạy không cần .env; hãy bỏ option này trong dự án thật dùng .env.
      ignoreEnvFile: true,
      validate: (environment): AppConfig => {
        const port = Number(environment.PORT ?? 3000);
        if (!Number.isInteger(port) || port < 1 || port > 65535) {
          throw new Error("PORT must be an integer between 1 and 65535");
        }

        return {
          PORT: port,
          APP_NAME: environment.APP_NAME ?? "NestJS Config Demo",
          NODE_ENV: environment.NODE_ENV ?? "development",
          JWT_SECRET: environment.JWT_SECRET,
        };
      },
    }),
  ],
  controllers: [ConfigController],
  providers: [AppInfoService],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService<AppConfig>);
  const port = configService.get<number>("PORT", 3000);

  await app.listen(port);
  console.log(`Server is running at http://localhost:${port}`);
}

void bootstrap();
