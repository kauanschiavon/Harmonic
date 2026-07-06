import { db } from "../database/connection";
import { Music } from "../models/Music";

export class MusicRepository {
    async findByMusicId(musicId: string): Promise<Music | undefined> {
        return await db<Music>("music")
            .where({ music_id: musicId })
            .first();
    }

    async create(music: Music): Promise<Music> {
        const [created] = await db<Music>("music")
            .insert(music)
            .returning("*");
        return created;
    }

    /*
     * Garante que a música existe no banco local.
     * Se já existir (pelo music_id do Spotify), retorna a existente.
     * Se não existir, cria e retorna o novo registro.
     */
    async findOrCreate(music: Music): Promise<Music> {
        const existing = await this.findByMusicId(music.music_id);
        if (existing) return existing;
        return await this.create(music);
    }
}