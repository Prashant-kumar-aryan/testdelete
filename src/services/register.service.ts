import { z } from "zod";

export const registerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters.")
    .max(50, "First name must not exceed 50 characters.")
    .regex(/^[A-Za-z-' ]+$/, "Please enter a valid name. Only alphabetic characters and spaces are allowed.")
    .min(1, "This field is required."),
  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters.")
    .max(50, "Last name must not exceed 50 characters.")
    .regex(/^[A-Za-z-' ]+$/, "Please enter a valid name. Only alphabetic characters and spaces are allowed.")
    .min(1, "This field is required."),
  email: z
    .string()
    .trim()
    .min(1, "This field is required.")
    .email("Invalid email format. Please ensure it follows the format: username@domain.com")
    .refine((val) => {
      const emailRegex = /^[a-zA-Z0-9]+([._-]?[a-zA-Z0-9]+)*@([a-zA-Z0-9]+(-?[a-zA-Z0-9]+)*\.)+[a-zA-Z]{2,}$/;
      if (!emailRegex.test(val)) return false;
      const [, domain] = val.split("@");
      if (domain.includes("--")) return false;
      const domainParts = domain.split(".");
      const tlds = domainParts.slice(1);
      for (let i = 0; i < tlds.length - 1; i++) {
        if (tlds[i] === tlds[i + 1]) return false;
      }
      return true;
    }, {
      message: "Invalid email format. Please ensure it follows the format: username@domain.com",
    }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(16, "Password must not exceed 16 characters.")
    .regex(/(?=.*[A-Z])/, "Must contain at least one uppercase letter.")
    .regex(/(?=.*\d)/, "Must contain at least one number.")
    .regex(/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, "Must contain one special character.")
    .min(1, "Your password must be 8-16 characters long and include a mix of uppercase letters, lowercase letters, numbers, and special characters."),
    
  preferableActivity: z
    .enum(['YOGA', 'PILATES', 'CARDIO', 'WEIGHTS', 'STRENGTH', 'FLEXIBILITY'])
    .optional(),

  target: z
    .enum([
      'Lose Weight',
      'Gain Weight',
      'Improve flexibility',
      'General fitness',
      'Build Muscle',
      'Rehabilitation/Recovery',
    ])
    .optional(),
});
 