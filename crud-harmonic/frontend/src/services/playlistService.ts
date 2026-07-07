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

export interface PlaylistWithAlbums extends Playlist {
    albums: { id: number; spotify_album_id: string; added_at: string }[];
}

export type CreatePlaylistData = Pick<Playlist, "user_id" | "name" | "description" | "cover_url" | "is_public">;
export type UpdatePlaylistData = Partial<CreatePlaylistData>;

export const playlistService = {

    // POST /playlists
    async create(data: CreatePlaylistData): Promise<Playlist> {
        // o backend espera o campo "public", não "is_public"
        const { is_public, ...rest } = data;
        const response = await api.post<Playlist>("/playlists", {
            ...rest,
            public: is_public,
        });
        return response.data;
    },

    // GET /playlists — feed público
    async findAll(): Promise<Playlist[]> {
        const response = await api.get<Playlist[]>("/playlists");
        return response.data;
    },

    // GET /playlists/:id (com álbuns)
    async findById(id: number): Promise<PlaylistWithAlbums> {
        const response = await api.get<PlaylistWithAlbums>(`/playlists/${id}`);
        return response.data;
    },

    // GET /users/:userId/playlists
    async findByUser(userId: number): Promise<Playlist[]> {
        const response = await api.get<Playlist[]>(`/users/${userId}/playlists`);
        return response.data;
    },

    // PATCH /playlists/:id
    async update(id: number, data: UpdatePlaylistData): Promise<Playlist> {
        const response = await api.patch<Playlist>(`/playlists/${id}`, data);
        return response.data;
    },

    // DELETE /playlists/:id
    async delete(id: number): Promise<void> {
        await api.delete(`/playlists/${id}`);
    },

    // POST /playlists/:id/albums
    async addAlbum(playlistId: number, spotifyAlbumId: string) {
        const response = await api.post(`/playlists/${playlistId}/albums`, {
            spotify_album_id: spotifyAlbumId,
        });
        return response.data;
    },

    // DELETE /playlists/:id/albums/:spotifyAlbumId
    async removeAlbum(playlistId: number, spotifyAlbumId: string): Promise<void> {
        await api.delete(`/playlists/${playlistId}/albums/${spotifyAlbumId}`);
    },
};
