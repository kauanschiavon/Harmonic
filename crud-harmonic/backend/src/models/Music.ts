export interface Music {
    music_id: string; // ID do Spotify — é a chave usada na tabela music
    title: string;
    duration_ms?: number;
    release_date?: string;
    album_id?: number | null;
}
