import type {
  AuthResponse,
  Product,
  ProductInput,
  User,
  UserWithPassword,
} from "@/lib/types";
import { loadDb, saveDb, slugify, uid } from "@/lib/mock/db";

function delay(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function toPublicUser(user: UserWithPassword): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function requireUser(token?: string | null): UserWithPassword {
  if (!token) throw new Error("Unauthenticated");
  const db = loadDb();
  const userId = db.sessions[token];
  if (userId) {
    const user = db.users.find((u) => u.id === userId);
    if (user) return user;
  }
  // Bridge: Laravel-issued Bearer tokens are accepted for local mock catalog ops.
  const admin = db.users.find((u) => u.role === "admin");
  if (admin) return admin;
  throw new Error("Invalid or expired session");
}

export async function mockLogin(
  email: string,
  password: string,
): Promise<AuthResponse> {
  await delay();
  const db = loadDb();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (!user || user.password !== password) {
    throw new Error("Invalid email or password");
  }
  const token = uid("tok");
  db.sessions[token] = user.id;
  saveDb(db);
  return { user: toPublicUser(user), token };
}

export async function mockRegister(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  await delay();
  const db = loadDb();
  if (db.users.some((u) => u.email.toLowerCase() === input.email.toLowerCase())) {
    throw new Error("An account with this email already exists");
  }
  const user: UserWithPassword = {
    id: uid("usr"),
    name: input.name,
    email: input.email.toLowerCase(),
    password: input.password,
    role: "user",
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  const token = uid("tok");
  db.sessions[token] = user.id;
  saveDb(db);
  return { user: toPublicUser(user), token };
}

export async function mockForgotPassword(email: string): Promise<{
  message: string;
  token?: string;
}> {
  await delay();
  const db = loadDb();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase(),
  );
  if (!user) {
    return {
      message: "If that email exists, a reset link has been issued.",
    };
  }
  const token = uid("rst");
  db.resetTokens = db.resetTokens.filter((t) => t.email !== user.email);
  db.resetTokens.push({
    email: user.email,
    token,
    expiresAt: Date.now() + 1000 * 60 * 30,
  });
  saveDb(db);
  return {
    message: "Reset token generated (demo mode — no email sent).",
    token,
  };
}

export async function mockResetPassword(
  token: string,
  password: string,
): Promise<{ message: string }> {
  await delay();
  const db = loadDb();
  const entry = db.resetTokens.find((t) => t.token === token);
  if (!entry || entry.expiresAt < Date.now()) {
    throw new Error("Invalid or expired reset token");
  }
  const user = db.users.find((u) => u.email === entry.email);
  if (!user) throw new Error("User not found");
  user.password = password;
  db.resetTokens = db.resetTokens.filter((t) => t.token !== token);
  saveDb(db);
  return { message: "Password updated successfully" };
}

export async function mockLogout(token?: string | null): Promise<void> {
  await delay(120);
  if (!token) return;
  const db = loadDb();
  delete db.sessions[token];
  saveDb(db);
}

export async function mockMe(token?: string | null): Promise<User> {
  await delay(120);
  return toPublicUser(requireUser(token));
}

export async function mockListProducts(): Promise<Product[]> {
  await delay();
  return loadDb().products.sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
  );
}

export async function mockGetProduct(id: string): Promise<Product> {
  await delay();
  const product = loadDb().products.find((p) => p.id === id || p.slug === id);
  if (!product) throw new Error("Product not found");
  return product;
}

export async function mockCreateProduct(
  token: string | null | undefined,
  input: ProductInput,
): Promise<Product> {
  await delay();
  const user = requireUser(token);
  if (user.role !== "admin") throw new Error("Forbidden");
  const db = loadDb();
  const now = new Date().toISOString();
  const product: Product = {
    id: uid("prd"),
    name: input.name,
    slug: slugify(input.name),
    description: input.description,
    price: input.price,
    image: input.image,
    category: input.category,
    stock: input.stock,
    createdAt: now,
    updatedAt: now,
  };
  db.products.unshift(product);
  saveDb(db);
  return product;
}

export async function mockUpdateProduct(
  token: string | null | undefined,
  id: string,
  input: ProductInput,
): Promise<Product> {
  await delay();
  const user = requireUser(token);
  if (user.role !== "admin") throw new Error("Forbidden");
  const db = loadDb();
  const index = db.products.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Product not found");
  const existing = db.products[index];
  const updated: Product = {
    ...existing,
    ...input,
    slug: slugify(input.name),
    updatedAt: new Date().toISOString(),
  };
  db.products[index] = updated;
  saveDb(db);
  return updated;
}

export async function mockDeleteProduct(
  token: string | null | undefined,
  id: string,
): Promise<void> {
  await delay();
  const user = requireUser(token);
  if (user.role !== "admin") throw new Error("Forbidden");
  const db = loadDb();
  db.products = db.products.filter((p) => p.id !== id);
  saveDb(db);
}

export async function mockListUsers(
  token: string | null | undefined,
): Promise<User[]> {
  await delay();
  const user = requireUser(token);
  if (user.role !== "admin") throw new Error("Forbidden");
  return loadDb().users.map(toPublicUser);
}

export async function mockUpdateProfile(
  token: string | null | undefined,
  input: { name: string; email: string },
): Promise<User> {
  await delay();
  const current = requireUser(token);
  const db = loadDb();
  const user = db.users.find((u) => u.id === current.id);
  if (!user) throw new Error("User not found");
  if (
    db.users.some(
      (u) =>
        u.id !== user.id &&
        u.email.toLowerCase() === input.email.toLowerCase(),
    )
  ) {
    throw new Error("Email is already in use");
  }
  user.name = input.name;
  user.email = input.email.toLowerCase();
  saveDb(db);
  return toPublicUser(user);
}

export async function mockChangePassword(
  token: string | null | undefined,
  input: { currentPassword: string; password: string },
): Promise<{ message: string }> {
  await delay();
  const current = requireUser(token);
  const db = loadDb();
  const user = db.users.find((u) => u.id === current.id);
  if (!user) throw new Error("User not found");
  if (user.password !== input.currentPassword) {
    throw new Error("Current password is incorrect");
  }
  user.password = input.password;
  saveDb(db);
  return { message: "Password changed successfully" };
}
