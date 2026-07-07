import { email, z } from "zod";



export const registerSchema = z.object({
  username: z
    .string()
    .min(4, "username deve ter pelo menos 4 caracteres")
    .max(30, "username deve ter no máximo 30 caracteres"),

  email: z
    .string()
    .email({ message: "email invalido"} ),


  password: z
    .string()
    .min(8, `senha deve ter no minimo 8 caracteres`),
});
