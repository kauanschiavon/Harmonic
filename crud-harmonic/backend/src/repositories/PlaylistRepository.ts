import { db } from "../database/connection";
import { Playlist, PlaylistAlbum } from "../models/Playlist";

export class PlaylistRepository {

    // ── Playlists ─────────────────────────────────────────────────────────

    async create(playlist: Omit<Playlist, "id" | "created_at">) {
        const [created] = await db("playlists").insert(playlist).returning("*");
        return created;
    }

    // Todas as playlists públicas (feed)
    async findAll() {
        return await db("playlists")
            .join("users", "playlists.user_id", "users.id")
            .select(
                "playlists.*",
                "users.username",
                "users.photo_url as user_photo"
            )
            .where("playlists.is_public", true)
            .orderBy("playlists.created_at", "desc");
    }

    // Playlists de um usuário específico
    async findByUser(user_id: number) {
        return await db("playlists")
            .where({ user_id })
            .orderBy("created_at", "desc");
    }

    async findById(id: number) {
        return await db("playlists")
            .join("users", "playlists.user_id", "users.id")
            .select("playlists.*", "users.username", "users.photo_url as user_photo")
            .where("playlists.id", id)
            .first();
    }

    async update(id: number, data: Partial<Playlist>) {
        const [updated] = await db("playlists").where({ id }).update(data).returning("*");
        return updated;
    }

    async delete(id: number) {
        await db("playlists").where({ id }).delete();
    }

    // ── Álbuns dentro de uma playlist ─────────────────────────────────────

    // Lista os spotify_album_ids da playlist
    async getAlbums(playlist_id: number) {
        return await db("playlist_albums")
            .where({ playlist_id })
            .orderBy("added_at", "asc");
    }

    // Adiciona um álbum do Spotify à playlist
    async addAlbum(playlist_id: number, spotify_album_id: string) {
        const [added] = await db("playlist_albums")
            .insert({ playlist_id, spotify_album_id })
            .returning("*");
        return added;
    }

    // Remove um álbum da playlist
    async removeAlbum(playlist_id: number, spotify_album_id: string) {
        await db("playlist_albums")
            .where({ playlist_id, spotify_album_id })
            .delete();
    }
}
