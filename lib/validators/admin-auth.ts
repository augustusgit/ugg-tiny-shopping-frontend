import { z } from "zod";

export const adminLoginCredentialsSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

export const adminLoginCodeSchema = z.object({
  code: z
    .string()
    .min(4, "Enter the verification code")
    .max(12, "Code looks too long"),
});

export const adminForgotSchema = z.object({
  value: z.string().min(1, "Email or username is required"),
});

export const adminVerifyCodeSchema = z.object({
  email: z.string().email("Enter a valid email"),
  code: z.string().min(4, "Enter the verification code"),
});

export const adminResetSchema = z
  .object({
    email: z.string().email("Enter a valid email"),
    token: z.string().min(4, "Verification code is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z.string().min(6, "Confirm your password"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });
