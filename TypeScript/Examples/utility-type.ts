/*
  Utility Types trong TypeScript

  Nội dung minh họa:
  1. Partial<T>
  2. Required<T>
  3. Pick<T, K>
  4. Omit<T, K>
  5. Record<K, T>
  6. Kết hợp Utility Types

  Chạy file:
  npx tsx TypeScript/Examples/utility-type.ts
*/

console.log("=== 1. Partial<T> ===");

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  password: string;
}

type UpdateUser = Partial<User>;

function updateUser(id: number, data: UpdateUser): User {
  const currentUser: User = {
    id,
    name: "Nhat",
    email: "nhat@gmail.com",
    age: 22,
    password: "secret",
  };

  return {
    ...currentUser,
    ...data,
  };
}

const updatedUser = updateUser(1, {
  name: "Nhat Nguyen",
  age: 23,
});

console.log("updatedUser:", updatedUser);

// Partial<User> cho phép gửi thiếu field khi update:
const updatePayload: UpdateUser = {
  email: "new-email@gmail.com",
};

console.log("updatePayload:", updatePayload);

console.log("\n=== 2. Required<T> ===");

interface Profile {
  name: string;
  avatar?: string;
  phone?: string;
}

type CompleteProfile = Required<Profile>;

const profile: CompleteProfile = {
  name: "Nhat",
  avatar: "avatar.png",
  phone: "0123456789",
};

console.log("completeProfile:", profile);

// Required<Profile> bắt buộc phải có đủ name, avatar và phone:
// const invalidProfile: CompleteProfile = { name: "Nhat" };

console.log("\n=== 3. Pick<T, K> ===");

type UserPreview = Pick<User, "id" | "name">;

const userPreview: UserPreview = {
  id: 1,
  name: "Nhat",
};

console.log("userPreview:", userPreview);

type UserListItem = Pick<User, "id" | "name" | "email">;

const users: UserListItem[] = [
  {
    id: 1,
    name: "Nhat",
    email: "nhat@gmail.com",
  },
  {
    id: 2,
    name: "Lan",
    email: "lan@gmail.com",
  },
];

console.log("users:", users);

console.log("\n=== 4. Omit<T, K> ===");

type PublicUser = Omit<User, "email" | "password">;

const publicUser: PublicUser = {
  id: 1,
  name: "Nhat",
  age: 22,
};

console.log("publicUser:", publicUser);

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    age: user.age,
  };
}

console.log("public user from full user:", toPublicUser(updatedUser));

console.log("\n=== 5. Record<K, T> ===");

type Role = "ADMIN" | "USER" | "GUEST";
type RoleLabel = Record<Role, string>;

const roleLabels: RoleLabel = {
  ADMIN: "Administrator",
  USER: "Normal User",
  GUEST: "Guest User",
};

console.log("roleLabels:", roleLabels);

type Status = "pending" | "success" | "failed";

type StatusConfig = Record<
  Status,
  {
    label: string;
    code: number;
    canRetry: boolean;
  }
>;

const statusConfig: StatusConfig = {
  pending: {
    label: "Pending",
    code: 1,
    canRetry: false,
  },
  success: {
    label: "Success",
    code: 2,
    canRetry: false,
  },
  failed: {
    label: "Failed",
    code: 3,
    canRetry: true,
  },
};

function getStatusConfig(status: Status) {
  return statusConfig[status];
}

console.log("failed config:", getStatusConfig("failed"));

console.log("\n=== 6. Combine Utility Types ===");

type EditableUserContact = Partial<Pick<User, "name" | "email">>;

function updateUserContact(id: number, data: EditableUserContact): void {
  console.log(`update contact for user ${id}:`, data);
}

updateUserContact(1, {
  email: "contact@gmail.com",
});

type CreateUserInput = Omit<User, "id">;

const createUserInput: CreateUserInput = {
  name: "Minh",
  email: "minh@gmail.com",
  age: 20,
  password: "strong-password",
};

console.log("createUserInput:", createUserInput);

type UserWithOptionalContact = Omit<User, "email"> &
  Partial<Pick<User, "email">>;

const userWithOptionalContact: UserWithOptionalContact = {
  id: 3,
  name: "An",
  age: 21,
  password: "secret",
};

console.log("userWithOptionalContact:", userWithOptionalContact);
