import {z} from "zod";

export const signUpSchema=z.object({
    email:z.string()
    .email({ message: "Invalid email address" })
    .regex(
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please provide a valid email address",
    ),
    password:z.string().min(6,"Password must be atleast 6 letters"),
  }
)

