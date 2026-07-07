import api from "./api";

export interface Playlist {
    id: number;
    user_id: number;
    name: string;
    description?: string;
    cover_url?: string;
    is_public?: boolean;
    created_at?: string;
    username?: string;
    user_photo?: string;
}

export interface PlaylistMusic {
    music_id: string;
    title: string;
    duration_ms: number;
    position: number;
}

export interface PlaylistWithMusics extends Playlist {
    musics: PlaylistMusic[];
}

export type CreatePlaylistData = Pick<Playlist, "user_id" | "name" | "description" | "cover_url" | "is_public">;
export type UpdatePlaylistData = Partial<Pick<Playlist, "name" | "description" | "is_public">>;

// create/update retornam a linha "crua" do banco (com "public" e "create_time",
// sem os alias que o feed e o findById já aplicam) — normalizamos aqui.
function normalize(raw: any): Playlist {
    const { public: rawPublic, create_time, is_public, created_at, ...rest } = raw ?? {};
    return {
        ...rest,
        is_public: is_public ?? rawPublic,
        created_at: created_at ?? create_time,
    };
}

export const playlistService = {

    // POST /playlists
    async create(data: CreatePlaylistData): Promise<Playlist> {
        // o backend espera o campo "public", não "is_public"
        const { is_public, ...rest } = data;
        const response = await api.post<Playlist>("/playlists", {
            ...rest,
            public: is_public,
        });
        return normalize(response.data);
    },

    // GET /playlists — feed público
    async findAll(): Promise<Playlist[]> {
        const response = await api.get<Playlist[]>("/playlists");
        return response.data;
    },

    // GET /playlists/:id (com músicas)
    async findById(id: number): Promise<PlaylistWithMusics> {
        const response = await api.get<PlaylistWithMusics>(`/playlists/${id}`);
        return response.data;
    },

    // GET /playlists/user/:userId
    async findByUser(userId: number): Promise<Playlist[]> {
        const response = await api.get<Playlist[]>(`/playlists/user/${userId}`);
        return response.data;
    },

    // PATCH /playlists/:id
    async update(id: number, data: UpdatePlaylistData): Promise<Playlist> {
        const { is_public, ...rest } = data;
        const body: Record<string, unknown> = { ...rest };
        if (is_public !== undefined) body.public = is_public;
        const response = await api.patch<Playlist>(`/playlists/${id}`, body);
        return normalize(response.data);
    },

    // DELETE /playlists/:id
    async delete(id: number, userId: number): Promise<void> {
        await api.delete(`/playlists/${id}`, { data: { user_id: userId } });
    },

    // POST /playlists/:id/musics
    async addMusic(playlistId: number, musicId: string, title?: string, durationMs?: number) {
        const response = await api.post(`/playlists/${playlistId}/musics`, {
            music_id: musicId,
            title,
            duration_ms: durationMs,
        });
        return response.data;
    },

    // DELETE /playlists/:id/musics/:musicId
    async removeMusic(playlistId: number, musicId: string): Promise<void> {
        await api.delete(`/playlists/${playlistId}/musics/${musicId}`);
    },

    // PATCH /playlists/:id/musics/reorder
    async reorder(playlistId: number, order: { music_id: string; position: number }[]): Promise<void> {
        await api.patch(`/playlists/${playlistId}/musics/reorder`, { order });
    },
};
