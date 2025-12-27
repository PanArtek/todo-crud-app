import { z } from "zod";

/**
 * Login form validation schema
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email jest wymagany")
    .email("Nieprawidłowy format email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Registration form validation schema
 */
export const registerSchema = z
  .object({
    email: z
      .string()
      .min(1, "Email jest wymagany")
      .email("Nieprawidłowy format email"),
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Hasło musi zawierać małą literę, wielką literę i cyfrę"
      ),
    confirmPassword: z.string().min(1, "Potwierdź hasło"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
