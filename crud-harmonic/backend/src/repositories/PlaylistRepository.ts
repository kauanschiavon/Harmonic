import { platform } from "node:os";
import { db } from "../database/connection";
import { Playlist, PlaylistMusic } from "../models/Playlist";
import { promises } from "node:stream";

export class PlaylistRepository{
    //playlist

    async create(data: Playlist): Promise<Playlist>{
        const [created] = await db<Playlist>("playlist")
        .insert(data)
        .returning("*");

        return created;
    }

    async findById(id: number): Promise<Playlist | undefined>{
        return await db<Playlist>("playlist")
        .where({id})
        .first();
    }

    // Feed de playlists de todos os usuários, com dados do autor (usado na página de Lists)
    async findAllWithAuthors() {
        return await db("playlist")
        .join("users", "playlist.user_id", "users.id")
        .select(
            "playlist.id",
            "playlist.user_id",
            "playlist.name",
            "playlist.description",
            "playlist.public as is_public",
            "playlist.created_at",
            "users.username",
            "users.photo_url as user_photo"
        )
        .orderBy("playlist.created_at", "desc");
    }

    async findByUser(userId: number): Promise<Playlist[]>{
        return await db<Playlist>("playlist")
        .where({user_id: userId})
        .orderBy("created_time", "desc");
    }

    async update(id:number, data:Partial<Playlist>): Promise<Playlist>{
        const [updated] = await db<Playlist>("playlist")
        .where({id})
        .update(data)
        .returning("*");

        return updated;
    }
    async delete(id:number){
        await db("playlist")
        .where({id}).delete();
    }

    //musica da playlist

    async addMusic(playlistId: number, musicId:string, position:number ):
    Promise<PlaylistMusic>{
        const [created] = await db<PlaylistMusic>("playlist_music")
        .insert({
            playlist_id: playlistId,
            music_id: musicId,
            position,
        })
        .returning("*");

        return created;
    }

    async findMusic(playlistId: number, musicId: string): Promise<PlaylistMusic | undefined>{
        return await db<PlaylistMusic>("playlist_music")
        .where({playlist_id: playlistId, music_id: musicId})
        .first()
    } 

    async listMusics(playlistId: number){
        return await db("playlist_music as pm")
        .join("music as m", "pm.music_id", "m.music_id")
        .where("pm.playlist_id", playlistId)
        .select(
            "m.music_id",
            "m.title",
            "m.duration_ms",
            "pm.position"
        )
        .orderBy("pm.position", "asc");
    }

    async removeMusic(playlistId: number, musicId:string ): Promise<void>{
        await db("playlist_music")
        .where({playlist_id:playlistId, music_id: musicId})
        .delete;
    }

    async getLastPosition(playlistId: number): Promise<number>{
        const result = await db("playlist_music")
        .where({playlist_id: playlistId})
        .max("position as max_position")
        .first();

        return result?.max_position??0
    }

    async reorder(playlistId:number, order:{ music_id: string; position: number}[]): Promise<void>{
        await Promise.all(
            order.map(({music_id, position})=>
            db("playlist_music")
        .where({playlist_id: playlistId, music_id})
        .update({position})
            )
        );
    }
}