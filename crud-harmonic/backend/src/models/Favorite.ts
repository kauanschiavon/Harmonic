export interface Favorite{
    user_id: number;
    music_id: string; // referencia music.music_id (spotify_id)
    created_at?: Date;
}