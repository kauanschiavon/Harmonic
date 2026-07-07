import { coerce, z } from "zod";

export const favoriteschema = z.object({
    user_id: z
    .coerce 
    .number(),

    music_id: z
    .string()
    .min(1, "music_id é obrigatório"),

    title: z
    .string()
    .optional(),

    duration: z
    .number()
    .optional(),

    releate_date: z
    .string()
    .optional(),
});