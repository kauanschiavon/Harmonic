import { z } from "zod";

const tamSenha = 8;

export const registerSchema = z.object({
    username: z
        .string()
        .min(4, "Username deve ter pelo menos 4 caracteres")
        .max(30, "Username deve ter no máximo 30 caracteres"),

    email: z
        .string()
        .email({ message: "Email inválido" }),

    password: z
        .string()
        .min(tamSenha, `Senha deve ter no mínimo ${tamSenha} caracteres`),
});
