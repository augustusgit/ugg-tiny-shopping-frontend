export interface AdminAccount {
  id: number;
  firstname: string | null;
  lastname: string | null;
  full_name?: string | null;
  username: string | null;
  email: string;
  mobile: string | null;
  image: string | null;
  created_by: number | null;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  roles?: string[];
  creator?: {
    id: number;
    name: string | null;
    email: string;
  } | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface CustomerAccount {
  id: number;
  firstname: string | null;
  lastname: string | null;
  full_name?: string | null;
  username: string | null;
  email: string;
  mobile: string | null;
  dob: string | null;
  sex: string | null;
  country_code: string | null;
  currency_code: string | null;
  ref_by: string | null;
  referral_code: string | null;
  address: Record<string, unknown> | string | null;
  description: string | null;
  timezone: string | null;
  active: boolean | number;
  ban_reason: string | null;
  kv?: number;
  ev?: number;
  sv?: number;
  ts?: number;
  tv?: number;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  last_visited_at: string | null;
  last_visited_from: string | null;
  roles?: string[];
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface AdminStats {
  total_admins: number;
  verified_admins: number;
  unverified_admins: number;
  phone_verified_admins: number;
  trashed_admins: number;
  recent_admins: number;
}

export interface CustomerStats {
  total_users: number;
  active_users: number;
  inactive_users: number;
  verified_users: number;
  phone_verified_users: number;
  trashed_users: number;
  recent_users: number;
}

export interface AdminListFilters {
  search?: string;
  role?: string;
  verified?: string;
  trashed?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export interface CustomerListFilters {
  search?: string;
  active?: string;
  country_code?: string;
  role?: string;
  verified?: string;
  trashed?: string;
  sort_by?: string;
  sort_dir?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export interface StoreAdminInput {
  firstname?: string;
  lastname?: string;
  username?: string;
  email: string;
  mobile?: string;
  password: string;
  password_confirmation: string;
  image?: string;
  role?: string;
  mark_email_verified?: boolean;
  mark_phone_verified?: boolean;
}

export interface UpdateAdminInput {
  firstname?: string | null;
  lastname?: string | null;
  username?: string | null;
  email?: string;
  mobile?: string | null;
  password?: string;
  password_confirmation?: string;
  image?: string | null;
  role?: string | null;
}

export interface StoreCustomerInput {
  firstname?: string;
  lastname?: string;
  username?: string;
  email: string;
  mobile?: string;
  password: string;
  password_confirmation: string;
  dob?: string;
  sex?: string;
  country_code?: string;
  currency_code?: string;
  timezone?: string;
  description?: string;
  active?: boolean;
  role?: string;
  mark_email_verified?: boolean;
  mark_phone_verified?: boolean;
}

export interface UpdateCustomerInput {
  firstname?: string | null;
  lastname?: string | null;
  username?: string | null;
  email?: string;
  mobile?: string | null;
  password?: string;
  password_confirmation?: string;
  dob?: string | null;
  sex?: string | null;
  country_code?: string | null;
  currency_code?: string | null;
  timezone?: string | null;
  description?: string | null;
  active?: boolean;
  ban_reason?: string | null;
  role?: string | null;
}
