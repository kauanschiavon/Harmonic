import api from "./api";

export interface FavoriteTrack {
    music_id: string;
    title: string;
    duration_ms?: number;
    created_at: string;
}

export const favoriteService = {

    // GET /favorites/:userId — músicas favoritas de um usuário (público)
    async listByUser(userId: number): Promise<FavoriteTrack[]> {
        const response = await api.get<FavoriteTrack[]>(`/favorites/${userId}`);
        return response.data;
    },

    // POST /favorites — adiciona música aos favoritos
    async add(data: { user_id: number; music_id: string; title?: string; duration?: number; releate_date?: string }): Promise<FavoriteTrack> {
        const response = await api.post<FavoriteTrack>("/favorites", data);
        return response.data;
    },

    // DELETE /favorites/:userId/:musicId
    async remove(userId: number, musicId: string): Promise<void> {
        await api.delete(`/favorites/${userId}/${musicId}`);
    },
};
