import api from "./api";

export interface Playlist {
    id: number;
    user_id: number;
    name: string;
    description?: string;
    public?: boolean;
    create_time?: string;
}

export interface PlaylistWithMusics extends Playlist {
    musics: {
        music_id: string;
        title: string;
        duration_ms?: number;
        position: number;
    }[];
}

export type CreatePlaylistData = {
    user_id: number;
    name: string;
    description?: string;
    public?: boolean;
};

export const playlistService = {
    async create(data: CreatePlaylistData): Promise<Playlist> {
        const res = await api.post<Playlist>("/playlists", data);
        return res.data;
    },
    async findByUser(userId: number): Promise<Playlist[]> {
        const res = await api.get<Playlist[]>(`/playlists/user/${userId}`);
        return res.data;
    },
    async findById(id: number): Promise<PlaylistWithMusics> {
        const res = await api.get<PlaylistWithMusics>(`/playlists/${id}`);
        return res.data;
    },
    async update(id: number, data: Partial<CreatePlaylistData>): Promise<Playlist> {
        const res = await api.patch<Playlist>(`/playlists/${id}`, data);
        return res.data;
    },
    async delete(id: number, userId: number): Promise<void> {
        await api.delete(`/playlists/${id}`, { data: { user_id: userId } });
    },
    async addMusic(playlistId: number, music: { music_id: string; title?: string; duration_ms?: number }): Promise<void> {
        await api.post(`/playlists/${playlistId}/musics`, music);
    },
    async removeMusic(playlistId: number, musicId: string): Promise<void> {
        await api.delete(`/playlists/${playlistId}/musics/${musicId}`);
    },
};
