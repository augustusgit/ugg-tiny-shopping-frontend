import { z } from "zod";

const optionalString = z.string().optional().or(z.literal(""));

export const storeAdminSchema = z
  .object({
    firstname: optionalString,
    lastname: optionalString,
    username: optionalString,
    email: z.string().email("Enter a valid email"),
    mobile: optionalString,
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z.string().min(6, "Confirm your password"),
    role: z.string().optional().or(z.literal("")),
    mark_email_verified: z.boolean().optional(),
    mark_phone_verified: z.boolean().optional(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export const updateAdminSchema = z
  .object({
    firstname: optionalString,
    lastname: optionalString,
    username: optionalString,
    email: z.string().email("Enter a valid email"),
    mobile: optionalString,
    password: z.string().optional().or(z.literal("")),
    password_confirmation: z.string().optional().or(z.literal("")),
    role: z.string().optional().or(z.literal("")),
  })
  .superRefine((d, ctx) => {
    if (d.password && d.password.length < 6) {
      ctx.addIssue({
        code: "custom",
        message: "Password must be at least 6 characters",
        path: ["password"],
      });
    }
    if (d.password && d.password !== d.password_confirmation) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["password_confirmation"],
      });
    }
  });

export const resetPasswordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z.string().min(6, "Confirm your password"),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export const syncRolesSchema = z.object({
  roles: z.array(z.string().min(1)).min(1, "Select at least one role"),
});

export const storeCustomerSchema = z
  .object({
    firstname: optionalString,
    lastname: optionalString,
    username: optionalString,
    email: z.string().email("Enter a valid email"),
    mobile: optionalString,
    password: z.string().min(6, "Password must be at least 6 characters"),
    password_confirmation: z.string().min(6, "Confirm your password"),
    country_code: optionalString,
    currency_code: optionalString,
    timezone: optionalString,
    sex: optionalString,
    dob: optionalString,
    description: optionalString,
    role: z.string().optional().or(z.literal("")),
    active: z.boolean().optional(),
    mark_email_verified: z.boolean().optional(),
    mark_phone_verified: z.boolean().optional(),
  })
  .refine((d) => d.password === d.password_confirmation, {
    message: "Passwords do not match",
    path: ["password_confirmation"],
  });

export const updateCustomerSchema = z
  .object({
    firstname: optionalString,
    lastname: optionalString,
    username: optionalString,
    email: z.string().email("Enter a valid email"),
    mobile: optionalString,
    password: z.string().optional().or(z.literal("")),
    password_confirmation: z.string().optional().or(z.literal("")),
    country_code: optionalString,
    currency_code: optionalString,
    timezone: optionalString,
    sex: optionalString,
    dob: optionalString,
    description: optionalString,
    role: z.string().optional().or(z.literal("")),
    active: z.boolean().optional(),
    ban_reason: optionalString,
  })
  .superRefine((d, ctx) => {
    if (d.password && d.password.length < 6) {
      ctx.addIssue({
        code: "custom",
        message: "Password must be at least 6 characters",
        path: ["password"],
      });
    }
    if (d.password && d.password !== d.password_confirmation) {
      ctx.addIssue({
        code: "custom",
        message: "Passwords do not match",
        path: ["password_confirmation"],
      });
    }
  });

export const banReasonSchema = z.object({
  ban_reason: z.string().min(2, "Ban reason is required").max(255),
});
