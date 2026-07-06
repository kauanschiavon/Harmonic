import {z} from "zod";

export const createCommentSchema = z.object({
    user_id: z
    .coerce
    .number(),

    review_id: z
    .coerce
    .number(),

    text: z
    .string()
    .min(1, "Comentário não pode ser vazio")
    .max(200)
});

export const updateCommentSchema = z.object({
    text: z
    .string()
    .min(1)
    .max(200),
});