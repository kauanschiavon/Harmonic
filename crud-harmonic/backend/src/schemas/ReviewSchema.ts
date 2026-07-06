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
    .string()
    .optional(),

  text: z
    .string()
    .max(1000),

  note: z
    .number()
    .min(1)
    .max(5),
}).refine(
  (data) => data.music_id || data.artist_id,
  { message: "Informe music_id ou artist_id" }
);