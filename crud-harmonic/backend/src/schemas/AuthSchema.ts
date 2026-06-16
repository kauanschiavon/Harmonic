import { userInfo } from "node:os";
import { z } from "zod";

//se um dia for alterado.
const tamSenha = 8;
const tamEmail = 6;

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "username deve ter pelo menos 4 caracteres")
    .max(30, "username deve ter no máximo 30 caracteres"),

  email: z.string().min(tamEmail, "email deve ter no minimo ${tamEmail} caracteres"),

  password: z.string().min(tamSenha, "senha deve ter no minimo ${tamSenha} caracteres"),
});
