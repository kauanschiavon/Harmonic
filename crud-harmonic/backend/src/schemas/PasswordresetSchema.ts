import { email, z } from "zod";


export const forgotPasswordSchema = z.object({
    email:z
    .string()
    .email({message: "email inválido"}),
});

export const resetPasswordSchema = z.object({
    token: z
    .string()
    .min(1,"token é obrigatório"), 
    newPassword: z
    .string()
    .min(8, `senha deve ter no minimo 8 caracteres`),
})