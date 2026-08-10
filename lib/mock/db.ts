import type { Product, UserWithPassword } from "@/lib/types";
import { SEED_PRODUCTS, SEED_USERS } from "@/lib/mock/seed";

const STORAGE_KEY = "tinystore_mock_db_v1";

export interface ResetToken {
  email: string;
  token: string;
  expiresAt: number;
}

export interface MockDb {
  users: UserWithPassword[];
  products: Product[];
  resetTokens: ResetToken[];
  sessions: Record<string, string>;
}

function createSeedDb(): MockDb {
  return {
    users: structuredClone(SEED_USERS),
    products: structuredClone(SEED_PRODUCTS),
    resetTokens: [],
    sessions: {},
  };
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function loadDb(): MockDb {
  if (!canUseStorage()) return createSeedDb();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seed = createSeedDb();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw) as MockDb;
  } catch {
    return createSeedDb();
  }
}

export function saveDb(db: MockDb) {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

export function resetDb() {
  const seed = createSeedDb();
  saveDb(seed);
  return seed;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
