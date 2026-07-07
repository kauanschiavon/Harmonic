import api from "./api";

export interface FavoriteTrack {
    music_id: string;
    title: string;
    duration_ms?: number;
    created_at: string;
}

export const favoriteService = {
    async add(userId: number, track: { music_id: string; title: string; duration_ms?: number }): Promise<void> {
        await api.post("/favorites", { user_id: userId, music_id: track.music_id, title: track.title, duration: track.duration_ms });
    },
    async remove(userId: number, musicId: string): Promise<void> {
        await api.delete(`/favorites/${userId}/${musicId}`);
    },
    async listByUser(userId: number): Promise<FavoriteTrack[]> {
        const res = await api.get<FavoriteTrack[]>(`/favorites/${userId}`);
        return res.data;
    },
};
