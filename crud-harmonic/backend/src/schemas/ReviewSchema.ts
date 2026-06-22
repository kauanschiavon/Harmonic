import { memoryUsage } from "node:process";
import { coerce, z } from "zod";


//validação
export const reviewSchema = z.object({

    user_id:z
    .coerce
    .number(),

    music_spotify_id: z
    .coerce
    .string()
    .optional(),

    artist_spotify_id: z
    .coerce
    .string()
    .optional(),

    text: z
    .string()
    .max(1000),

    note: z
    .number()
    .min(1)
    .max(5)
    .multipleOf(1000)
})

