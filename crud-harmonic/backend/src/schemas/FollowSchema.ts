import { z } from "zod";

export const followSchema = z.object({
  follower_id: z
    .coerce
    .number()
    .int()
    .positive("follower_id deve ser um número positivo"),
});