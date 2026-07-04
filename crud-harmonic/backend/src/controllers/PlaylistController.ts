import { Request, Response } from "express";
import { PlaylistRepository } from "../repositories/PlaylistRepository";

const repository = new PlaylistRepository();

export class PlaylistController {

    // POST /playlists
    async create(req: Request, res: Response) {
        try {
            const playlist = await repository.create(req.body);
            return res.status(201).json(playlist);
        } catch (error) {
            return res.status(500).json({ message: "Erro ao criar playlist", error });
        }
    }

    // GET /playlists — feed público
    async findAll(req: Request, res: Response) {
        try {
            const playlists = await repository.findAll();
            return res.json(playlists);
        } catch (error) {
            return res.status(500).json({ message: "Erro ao buscar playlists", error });
        }
    }

    // GET /playlists/:id
    async findById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const playlist = await repository.findById(Number(id));

            if (!playlist) {
                return res.status(404).json({ message: "Playlist não encontrada" });
            }

            const albums = await repository.getAlbums(Number(id));
            return res.json({ ...playlist, albums });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao buscar playlist", error });
        }
    }

    // GET /users/:userId/playlists
    async findByUser(req: Request, res: Response) {
        try {
            const { userId } = req.params;
            const playlists = await repository.findByUser(Number(userId));
            return res.json(playlists);
        } catch (error) {
            return res.status(500).json({ message: "Erro ao buscar playlists do usuário", error });
        }
    }

    // PATCH /playlists/:id
    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const playlist = await repository.update(Number(id), req.body);
            return res.json(playlist);
        } catch (error) {
            return res.status(500).json({ message: "Erro ao atualizar playlist", error });
        }
    }

    // DELETE /playlists/:id
    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await repository.delete(Number(id));
            return res.status(200).json({ message: "Playlist deletada" });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao deletar playlist", error });
        }
    }

    // POST /playlists/:id/albums  { spotify_album_id }
    async addAlbum(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { spotify_album_id } = req.body;

            if (!spotify_album_id) {
                return res.status(400).json({ message: "spotify_album_id é obrigatório" });
            }

            const added = await repository.addAlbum(Number(id), String(spotify_album_id));
            return res.status(201).json(added);
        } catch (error) {
            return res.status(500).json({ message: "Erro ao adicionar álbum", error });
        }
    }

    // DELETE /playlists/:id/albums/:spotifyAlbumId
    async removeAlbum(req: Request, res: Response) {
        try {
            const { id, spotifyAlbumId } = req.params;
            await repository.removeAlbum(Number(id), String(spotifyAlbumId));
            return res.status(200).json({ message: "Álbum removido da playlist" });
        } catch (error) {
            return res.status(500).json({ message: "Erro ao remover álbum", error });
        }
    }
}
