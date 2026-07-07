import { Router } from "express";
import { getArtist, searchSpotify } from "../services/spotifyService";
import axios from "axios";

const router = Router();

// Busca geral — já existe em UserRoutes mas também aqui como alias limpo
router.get("/search", async (req, res) => {
    const { q } = req.query as { q: string };
    if (!q) return res.status(400).json({ error: "q obrigatório" });
    try {
        const results = await searchSpotify(q);
        return res.json({
            artists: results.artists?.items.map((a: any) => ({ id: a.id, name: a.name, image: a.images?.[0]?.url, spotifyUrl: a.external_urls.spotify })),
            albums: results.albums?.items.map((al: any) => ({ id: al.id, name: al.name, artist: al.artists?.[0]?.name, artistId: al.artists?.[0]?.id, image: al.images?.[0]?.url, releaseDate: al.release_date })),
            tracks: results.tracks?.items.map((t: any) => ({ id: t.id, name: t.name, artist: t.artists[0]?.name, artistId: t.artists[0]?.id, album: t.album.name, image: t.album.images?.[0]?.url, spotifyUrl: t.external_urls.spotify })),
        });
    } catch (e) { return res.status(500).json({ message: "Erro na busca" }); }
});

// Detalhes do artista
router.get("/spotify/artists/:id", async (req, res) => {
    try {
        const data = await getArtist(String(req.params.id));
        return res.json(data);
    } catch { return res.status(404).json({ message: "Artista não encontrado" }); }
});

// Álbuns do artista
router.get("/spotify/artists/:id/albums", async (req, res) => {
    try {
        const { getToken } = await import("../services/spotifyService");
        const token = await (getToken as any)();
        const response = await axios.get(`https://api.spotify.com/v1/artists/${req.params.id}/albums`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { limit: 20, include_groups: "album,single", market: "BR" },
        });
        return res.json(response.data);
    } catch { return res.status(404).json({ message: "Álbuns não encontrados" }); }
});

// Top tracks do artista
router.get("/spotify/artists/:id/top-tracks", async (req, res) => {
    try {
        const { getToken } = await import("../services/spotifyService");
        const token = await (getToken as any)();
        const response = await axios.get(`https://api.spotify.com/v1/artists/${req.params.id}/top-tracks`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { market: "BR" },
        });
        return res.json(response.data);
    } catch { return res.status(404).json({ message: "Tracks não encontradas" }); }
});

export default router;
