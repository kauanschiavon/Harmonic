import { Request, Response } from "express";
import { searchSpotify, getArtist, getAlbum } from "../services/spotifyService";

export class SpotifyController {

    // GET /search?q=...
    async search(req: Request, res: Response) {
        try {
            const { q } = req.query as { q: string };

            if (!q) {
                return res.status(400).json({ error: "Parâmetro q obrigatório" });
            }

            const results = await searchSpotify(String(q));

            return res.json({
                artists: results.artists?.items.map((artist: any) => ({
                    id: artist.id,
                    name: artist.name,
                    image: artist.images?.[0]?.url,
                    spotifyUrl: artist.external_urls.spotify,
                })),
                albums: results.albums?.items.map((album: any) => ({
                    id: album.id,
                    name: album.name,
                    artist: album.artists?.[0]?.name,
                    image: album.images?.[0]?.url,
                    releaseDate: album.release_date,
                })),
                tracks: results.tracks?.items.map((track: any) => ({
                    id: track.id,
                    name: track.name,
                    artist: track.artists[0]?.name,
                    album: track.album.name,
                    spotifyUrl: track.external_urls.spotify,
                })),
            });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao buscar no Spotify", error });
        }
    }

    // GET /artists/:id
    async findArtist(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const artist = await getArtist(String(id));
            return res.json(artist);
        } catch (error) {
            return res.status(500).json({ message: "Erro ao buscar artista", error });
        }
    }

    // GET /albums/:id
    async findAlbum(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const album = await getAlbum(String(id));
            return res.json(album);
        } catch (error) {
            return res.status(500).json({ message: "Erro ao buscar álbum", error });
        }
    }
}
