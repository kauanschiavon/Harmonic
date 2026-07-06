import {z} from "zod";

export const createPlaylistSchema = z.object({
    user_id: z
    .coerce
    .number(),

    name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(200),

    description: z
    .string()
    .optional(),

    public: z
    .boolean()
    .optional()
    .default(true),
})

export const updatePlaylistSchema = z.object({
    name: z
    .string()
    .min(1)
    .max(200)
    .optional(),

    description: z
    .string()
    .optional(),

    public: z
    .boolean()
    .optional(),
});

export const addMusicSchema = z.object({
    music_id: z
    .string()
    .min(1, "id_music é obrigatório"),

    title: z
    .string()
    .optional(),

    duration_ms: z
    .number()
    .optional(),

    position: z
    .number()
    .int()
    .min(1)
    .optional(),
});


export const reorderSchema = z.object({
    order: z
    .array(z.object({

        music_id: z
        .string(),

        position: z
        .number()
        .int()
        .min(1),
    }))
    .min(1,"Informe a nova ordem das musicas."),
});