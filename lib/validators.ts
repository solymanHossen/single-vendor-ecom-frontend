import { z } from "zod"

// Mirrors src/auth/dto/password.schema.ts on the backend, so the client
// never accepts a password the backend will reject.
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one lowercase letter, one uppercase letter, and one digit"
  )

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const registerSchema = z.object({
  name: z.string().max(100).optional(),
  email: z.string().email("Enter a valid email address"),
  password: passwordSchema,
})

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Mirrors src/users/dto/update-profile.dto.ts on the backend.
export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(150)
    .optional(),
  phone: z
    .string()
    .trim()
    .min(7, "Phone must be at least 7 characters")
    .max(20)
    .regex(
      /^[+0-9()\-\s]+$/,
      "Phone may only contain digits, spaces, and + ( ) - characters"
    )
    .nullable()
    .optional(),
  avatarUrl: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .max(1000)
    .nullable()
    .optional(),
})
