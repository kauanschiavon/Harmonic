import { email, z } from "zod";

//se um dia for alterado.
const tamSenha = 8;
const tamEmail = 6;

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
    .min(tamSenha, `senha deve ter no minimo" ${tamSenha} "caracteres`),
});
