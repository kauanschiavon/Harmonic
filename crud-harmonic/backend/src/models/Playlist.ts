export interface Playlist{
    id?: number,
    user_id:number,
    name: string;
    description?: string;
    public?: boolean;
    created_at?: Date;
}

export interface PlaylistMusic{
    playlist_id: number;
    music_id: string;
    position:number;
}