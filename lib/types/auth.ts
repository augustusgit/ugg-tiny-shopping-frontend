export type AuthRealm = "admin" | "customer";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  username?: string | null;
  mobile?: string | null;
}
