# TypeScript Theory

## 12. Decorator cơ bản & vì sao NestJS dùng Decorator

### 1. Decorator là gì?

`Decorator` là một function đặc biệt dùng để gắn metadata hoặc thêm hành vi cho:

- Class
- Method
- Property
- Parameter

Ví dụ đơn giản:

```ts
function Logger(constructor: Function): void {
  console.log("Class created:", constructor.name);
}

@Logger
class UserService {}
```

Khi `@Logger` được áp dụng, decorator nhận thông tin về `UserService`.

Hiểu đơn giản:

```txt
Decorator -> cách đánh dấu class/method/property/parameter
```

Framework hoặc code khác có thể đọc những dấu hiệu này để biết cần xử lý class/method đó như thế nào.

### 2. Cần bật experimentalDecorators

Trong TypeScript, decorator thường cần được bật trong `tsconfig.json`.

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

Với NestJS, project thường đã được cấu hình sẵn phần này. Khi làm với dependency injection nâng cao, NestJS cũng hay dùng thêm metadata reflection.

### 3. Class decorator

Class decorator áp dụng lên class.

```ts
function Controller(path: string) {
  return function (constructor: Function): void {
    console.log(`Controller path: ${path}`);
    console.log(`Controller class: ${constructor.name}`);
  };
}

@Controller("users")
class UsersController {}
```

Ở đây `@Controller("users")` đánh dấu `UsersController` là controller có base route là `/users`.

### 4. Method decorator

Method decorator áp dụng lên method.

```ts
function Get(path: string = "") {
  return function (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ): void {
    console.log(`GET route: ${path}`);
    console.log(`Method name: ${propertyKey}`);
  };
}

class UsersController {
  @Get(":id")
  getUser(): void {}
}
```

Trong NestJS, `@Get(":id")` nói rằng method này xử lý request `GET /users/:id`.

### 5. Property decorator

Property decorator áp dụng lên property.

```ts
function Required(target: object, propertyKey: string): void {
  console.log(`Required property: ${propertyKey}`);
}

class CreateUserDto {
  @Required
  name: string;
}
```

Trong thực tế, các thư viện validation có thể dùng decorator để đánh dấu field nào cần validate.

### 6. Parameter decorator

Parameter decorator áp dụng lên parameter của method hoặc constructor.

```ts
function Param(name: string) {
  return function (
    target: object,
    propertyKey: string,
    parameterIndex: number,
  ): void {
    console.log(`Param ${name} at index ${parameterIndex}`);
  };
}

class UsersController {
  getUser(@Param("id") id: string): void {
    console.log(id);
  }
}
```

Trong NestJS, `@Param("id")` nói rằng parameter `id` sẽ được lấy từ URL param.

### 7. Decorator trong NestJS

Trong NestJS bạn sẽ gặp decorator rất nhiều:

```ts
@Controller("users")
export class UsersController {}
```

Ở đây `@Controller("users")` nói với NestJS rằng class này là controller, base route là `/users`.

Ví dụ method:

```ts
@Get()
findAll() {
  return [];
}
```

`@Get()` nói với NestJS rằng method này xử lý HTTP GET request.

### 8. Một ví dụ NestJS hoàn chỉnh

```ts
@Controller("users")
export class UsersController {
  @Get(":id")
  getUser(@Param("id") id: string) {
    return {
      id,
      name: "Nhat",
    };
  }
}
```

Ý nghĩa:

```txt
@Controller("users")
-> đánh dấu class là controller, base route là /users

@Get(":id")
-> đánh dấu method xử lý GET /users/:id

@Param("id")
-> lấy parameter id từ URL
```

Decorator giúp code nhìn rõ intent hơn.

### 9. Vì sao NestJS dùng decorator?

NestJS dùng decorator vì framework cần đọc metadata để biết:

- Class nào là controller.
- Class nào là service/provider.
- Route nào xử lý `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- Dependency nào cần inject.
- Parameter nào lấy từ `body`, `query`, `param`.
- Guard, pipe, interceptor nào cần chạy.

Ví dụ:

```ts
@Injectable()
export class UsersService {}
```

`@Injectable()` nói với NestJS rằng class này có thể tham gia vào hệ thống Dependency Injection.

Sau đó:

```ts
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
```

NestJS có thể inject `UsersService` vào `UsersController`.

Tóm gọn:

```txt
Decorator
-> gắn metadata

NestJS
-> đọc metadata

Framework
-> cấu hình route, DI, validation, guards, pipes, interceptors...
```

### 10. Những decorator NestJS nên nhớ

#### 1. Controller

```ts
@Controller("users")
```

Đánh dấu một class là controller.

#### 2. HTTP Methods

```ts
@Get()
@Post()
@Put()
@Patch()
@Delete()
```

Map method với HTTP request.

#### 3. Request data

```ts
@Body()
@Param()
@Query()
```

Lấy dữ liệu từ request.

#### 4. Dependency Injection

```ts
@Injectable()
```

Đánh dấu class có thể được NestJS quản lý và inject.

#### 5. Module

```ts
@Module({
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
```

`@Module()` cung cấp metadata cho NestJS về module.

### 11. Decorator không chạy theo từng request

Ví dụ:

```ts
@Controller("users")
class UsersController {}
```

Có thể hiểu gần giống:

```txt
"NestJS, hãy gắn metadata controller vào class này."
```

Nó không có nghĩa là mỗi request sẽ chạy lại decorator đó. Decorator thường được xử lý khi class được định nghĩa hoặc khi ứng dụng khởi tạo metadata, không phải như một request handler.

Business logic vẫn nằm trong method:

```ts
@Get()
getUsers() {
  return this.usersService.findAll();
}
```

`@Get()` chỉ giúp NestJS biết method `getUsers()` dùng để xử lý route nào.

### 12. Lỗi thường gặp

#### 1. Nghĩ decorator chứa toàn bộ logic

Không đúng. Decorator chủ yếu gắn metadata hoặc bọc thêm hành vi.

```ts
@Get()
getUsers() {
  return this.usersService.findAll();
}
```

Business logic nằm trong `getUsers()` và `UsersService`, không nằm hoàn toàn trong `@Get()`.

#### 2. Nghĩ @Injectable() tự đăng ký service ở mọi nơi

Không hẳn. `@Injectable()` giúp class có metadata phù hợp để tham gia Dependency Injection, nhưng service vẫn cần được đăng ký trong module/provider phù hợp.

#### 3. Nghĩ decorator chỉ có ở NestJS

Không. Decorator là concept trong TypeScript/JavaScript ecosystem. NestJS chỉ là framework sử dụng decorator rất nhiều.

#### 4. Quên bật experimentalDecorators

Nếu TypeScript báo lỗi với cú pháp `@Decorator`, hãy kiểm tra `tsconfig.json`.

```json
{
  "compilerOptions": {
    "experimentalDecorators": true
  }
}
```

### 13. Câu hỏi thường gặp

1. Decorator trong TypeScript là gì?
   - Là một function đặc biệt dùng để gắn metadata hoặc thêm hành vi cho class, method, property hoặc parameter.
2. Tại sao NestJS sử dụng decorator?
   - Vì decorator giúp gắn metadata để framework hiểu controller, route, provider, parameter và dependency injection.
3. `@Controller()` trong NestJS làm gì?
   - Đánh dấu một class là controller và có thể định nghĩa base route cho controller đó.
4. `@Injectable()` làm gì trong NestJS?
   - Đánh dấu một class là provider có thể tham gia vào hệ thống Dependency Injection.
5. `@Get()` làm gì?
   - Đánh dấu một method trong controller là handler cho HTTP GET request.
6. Vai trò của metadata trong NestJS là gì?
   - Metadata cung cấp thông tin về class, method, parameter để NestJS cấu hình route, DI, validation, guards, pipes và các thành phần khác.
7. Decorator có chạy mỗi khi có request không?
   - Thường là không. Decorator chủ yếu chạy khi class/method được định nghĩa hoặc khi framework khởi tạo metadata.

Lệnh terminal để chạy file example:

```bash
npx tsx TypeScript/Examples/decorator.ts
```
