import { z } from "zod";

// validação
export const reviewSchema = z.object({

  user_id: z
    .coerce
    .number(),

  music_id: z
    .coerce
    .string()
    .optional(),

  artist_id: z
    .coerce
    .string(),

  text: z
    .string()
    .max(1000),

  note: z
    .number()
    .min(1)
    .max(5),
});
