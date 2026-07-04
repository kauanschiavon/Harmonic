import axios from "axios";

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

// Busca um novo token, reaproveitando o atual enquanto for válido
const getToken = async () => {
    if (cachedToken && Date.now() < tokenExpiresAt) {
        return cachedToken;
    }

    const response = await axios.post(
        "https://accounts.spotify.com/api/token",
        "grant_type=client_credentials",
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${Buffer.from(
                    `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                ).toString("base64")}`,
            },
        }
    );

    cachedToken = response.data.access_token;
    tokenExpiresAt = Date.now() + response.data.expires_in * 1000 - 60_000; // margem de 1 min
    return cachedToken;
};

export const searchSpotify = async (query: string, type = "artist,album,track") => {
    const token = await getToken();
    const response = await axios.get("https://api.spotify.com/v1/search", {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: query, type, limit: 10 },
    });
    return response.data;
};

export const getArtist = async (spotifyId: string) => {
    const token = await getToken();
    const response = await axios.get(`https://api.spotify.com/v1/artists/${spotifyId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export const getAlbum = async (spotifyId: string) => {
    const token = await getToken();
    const response = await axios.get(`https://api.spotify.com/v1/albums/${spotifyId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};
