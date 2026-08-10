import { z } from "zod";

export const customerLoginSchema = z.object({
  username: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
});

export const customerRegisterSchema = z
  .object({
    firstname: z.string().min(1, "First name is required"),
    lastname: z.string().min(1, "Last name is required"),
    email: z.string().email("Enter a valid email"),
    mobile: z
      .string()
      .min(7, "Enter a valid mobile number")
      .regex(/^[0-9+\-\s]+$/, "Mobile number can only contain digits and + -"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z.string().min(6, "Confirm your password"),
    country_code: z.string().min(2, "Select a country"),
    country: z.string().min(2, "Select a country"),
    currency_code: z.string().min(3, "Select a currency"),
    agree: z.boolean().refine((value) => value === true, {
      message: "You must accept the terms to continue",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export const customerVerifyRegisterSchema = z.object({
  email: z.string().email("Enter a valid email"),
  code: z.string().min(4, "Email verification code is required"),
  mobile_code: z.string().min(4, "Mobile verification code is required"),
});

export const customerForgotSchema = z.object({
  value: z.string().min(1, "Email or username is required"),
});

export const customerVerifyCodeSchema = z.object({
  email: z.string().email("Enter a valid email"),
  code: z.string().min(4, "Enter the verification code"),
});

export const customerResetSchema = z
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
