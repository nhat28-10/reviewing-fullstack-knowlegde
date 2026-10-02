/*
  Decorator trong TypeScript

  Nội dung minh họa:
  1. Decorator là function gắn metadata
  2. Class decorator
  3. Method decorator
  4. Parameter decorator
  5. Injectable decorator
  6. Mô phỏng cách NestJS đọc metadata

  Chạy file:
  npx tsx TypeScript/Examples/decorator.ts

  Lưu ý:
  File này gọi decorator function thủ công để chạy được mà không cần bật
  experimentalDecorators. Cú pháp @Decorator thật trong NestJS tương đương
  với ý tưởng được mô phỏng bên dưới.
*/

type Constructor = new (...args: unknown[]) => object;

type RouteMetadata = {
  method: "GET" | "POST";
  path: string;
  handlerName: string;
  params: Record<number, string>;
};

type ControllerMetadata = {
  basePath: string;
  routes: RouteMetadata[];
};

const controllers = new Map<Function, ControllerMetadata>();
const injectables = new Set<Function>();

function getOrCreateControllerMetadata(
  constructor: Function,
): ControllerMetadata {
  const existingMetadata = controllers.get(constructor);

  if (existingMetadata) {
    return existingMetadata;
  }

  const metadata: ControllerMetadata = {
    basePath: "",
    routes: [],
  };

  controllers.set(constructor, metadata);

  return metadata;
}

function Controller(basePath: string) {
  return function (constructor: Function): void {
    const metadata = getOrCreateControllerMetadata(constructor);

    metadata.basePath = basePath;
  };
}

function Injectable() {
  return function (constructor: Function): void {
    injectables.add(constructor);
  };
}

function createRouteDecorator(method: "GET" | "POST") {
  return function (path: string = "") {
    return function (
      target: object,
      propertyKey: string,
      _descriptor: PropertyDescriptor,
    ): void {
      const metadata = getOrCreateControllerMetadata(target.constructor);
      const existedRoute = metadata.routes.find(
        (route) => route.handlerName === propertyKey,
      );

      if (existedRoute) {
        existedRoute.method = method;
        existedRoute.path = path;
        return;
      }

      metadata.routes.push({
        method,
        path,
        handlerName: propertyKey,
        params: {},
      });
    };
  };
}

const Get = createRouteDecorator("GET");
const Post = createRouteDecorator("POST");

function Param(paramName: string) {
  return function (
    target: object,
    propertyKey: string,
    parameterIndex: number,
  ): void {
    const metadata = getOrCreateControllerMetadata(target.constructor);
    let route = metadata.routes.find(
      (item) => item.handlerName === propertyKey,
    );

    if (!route) {
      route = {
        method: "GET",
        path: "",
        handlerName: propertyKey,
        params: {},
      };

      metadata.routes.push(route);
    }

    route.params[parameterIndex] = paramName;
  };
}

class UsersService {
  findAll() {
    return [
      { id: 1, name: "Nhat" },
      { id: 2, name: "Minh" },
    ];
  }

  findById(id: string) {
    return {
      id,
      name: "Nhat",
    };
  }

  create(name: string) {
    return {
      id: 3,
      name,
    };
  }
}

class UsersController {
  constructor(private readonly usersService: UsersService) {}

  findAll() {
    return this.usersService.findAll();
  }

  getUser(id: string) {
    return this.usersService.findById(id);
  }

  createUser(name: string) {
    return this.usersService.create(name);
  }
}

function applyMethodDecorator(
  target: object,
  propertyKey: string,
  decorator: (
    target: object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => void,
): void {
  const descriptor = Object.getOwnPropertyDescriptor(target, propertyKey);

  if (!descriptor) {
    throw new Error(`Method ${propertyKey} does not exist`);
  }

  decorator(target, propertyKey, descriptor);
}

console.log("=== 1. Apply Decorators ===");

Injectable()(UsersService);
Controller("users")(UsersController);

applyMethodDecorator(UsersController.prototype, "findAll", Get());
applyMethodDecorator(UsersController.prototype, "getUser", Get(":id"));
applyMethodDecorator(UsersController.prototype, "createUser", Post());

Param("id")(UsersController.prototype, "getUser", 0);

console.log("UsersService injectable:", injectables.has(UsersService));
console.log("UsersController registered:", controllers.has(UsersController));

console.log("\n=== 2. Metadata Result ===");

const usersMetadata = controllers.get(UsersController);

console.log(JSON.stringify(usersMetadata, null, 2));

console.log("\n=== 3. Simulate NestJS Route Table ===");

function printRouteTable(controller: Constructor): void {
  const metadata = controllers.get(controller);

  if (!metadata) {
    console.log("No metadata found");
    return;
  }

  for (const route of metadata.routes) {
    const fullPath = `/${metadata.basePath}/${route.path}`.replace(/\/$/, "");

    console.log(`${route.method} ${fullPath} -> ${route.handlerName}()`);
  }
}

printRouteTable(UsersController);

console.log("\n=== 4. Call Controller Methods ===");

const usersController = new UsersController(new UsersService());

console.log("GET /users:", usersController.findAll());
console.log("GET /users/1:", usersController.getUser("1"));
console.log("POST /users:", usersController.createUser("Lan"));

console.log("\n=== 5. Equivalent @Decorator Syntax ===");

console.log(`
// Trong NestJS, đoạn mô phỏng phía trên thường được viết như sau:

@Injectable()
class UsersService {}

@Controller("users")
class UsersController {
  @Get()
  findAll() {}

  @Get(":id")
  getUser(@Param("id") id: string) {}

  @Post()
  createUser() {}
}
`);
