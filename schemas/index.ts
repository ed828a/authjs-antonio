import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Email is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export type LoginSchema = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email({ message: "Email is required." }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long." }),
  name: z.string().min(1, "name is required."),
});

export type RegisterSchema = z.infer<typeof registerSchema>;
