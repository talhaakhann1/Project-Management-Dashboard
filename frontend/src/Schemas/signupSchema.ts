import { z } from "zod";

export const signupSchema = z.object({
  fullName: z
    .string()
    .min(8, "fullName must be atleast 8 letters")
    .regex(
      /^[A-Za-z]+(?:[' -][A-Za-z]+)+$/,
      "Please enter a valid first and last name using only letters.",
    ),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please provide a valid email address",
    ),
  password: z.string().min(6, "Password must be atleast 6 letters"),
  acceptTerms: z.boolean().refine((value) => value === true, {
    message: "You must accept the Terms and Conditions.",
  }),
});
