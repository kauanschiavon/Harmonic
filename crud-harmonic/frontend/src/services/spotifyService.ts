import api from "./api";

export interface SpotifyAlbum {
    id: string;
    name: string;
    artist?: string;
    artistId?: string;
    image?: string;
    releaseDate?: string;
}

export interface SpotifyArtist {
    id: string;
    name: string;
    image?: string;
    spotifyUrl: string;
}

export interface SpotifyTrack {
    id: string;
    name: string;
    artist: string;
    artistId?: string;
    album: string;
    image?: string;
    spotifyUrl: string;
}

export interface SearchResults {
    artists: SpotifyArtist[];
    albums: SpotifyAlbum[];
    tracks: SpotifyTrack[];
}

export const spotifyService = {

    // GET /search?q=...
    async search(query: string): Promise<SearchResults> {
        const response = await api.get<SearchResults>("/search", { params: { q: query } });
        return response.data;
    },

    // GET /albums/:id
    async getAlbum(spotifyId: string) {
        const response = await api.get(`/albums/${spotifyId}`);
        return response.data;
    },

    // GET /artists/:id
    async getArtist(spotifyId: string) {
        const response = await api.get(`/artists/${spotifyId}`);
        return response.data;
    },
};
