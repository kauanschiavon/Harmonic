import { z } from "zod";

export const reviewLikeSchema = z.object({
  user_id: z.coerce.number(),
});