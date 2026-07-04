export interface Playlist {
    id?: number;
    user_id: number;
    name: string;
    description?: string;
    cover_url?: string;
    is_public?: boolean;
    created_at?: string;
}

export interface PlaylistAlbum {
    id?: number;
    playlist_id: number;
    spotify_album_id: string;
    added_at?: string;
}
