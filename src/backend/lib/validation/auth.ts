import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Please enter a valid email address or phone number."),
  email: z.string().trim().email("Please enter a valid email address.").optional(),
  password: z.string().min(6, "Password must be at least 6 characters."),
  loginContext: z.enum(["customer", "admin"]).optional(),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters."),
  email: z.string().trim().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Za-z]/, "Password must contain at least one letter.")
    .regex(/[0-9]/, "Password must contain at least one number."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
