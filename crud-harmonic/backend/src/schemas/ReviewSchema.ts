import { memoryUsage } from "node:process";
import { z } from "zod";


export const reviewSchema = z.object({

    music_id: z
    .string()
    .optional,

    artist_id: z
    .string()
    .optional,

    text: z
    .string()
    .max(1000),

    note: z
    .number()
    .min(1)
    .max(5)
})

