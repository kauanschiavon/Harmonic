export interface Artist {
    artist_id: string; // ID do Spotify — é a chave usada na tabela artist
    name: string;
    bio?: string;
    photo_url?: string;
}
