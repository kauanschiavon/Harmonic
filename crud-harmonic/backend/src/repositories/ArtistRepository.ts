import { db } from "../database/connection";
import { Artist } from "../models/Artist";

export class ArtistRepository {

  async findByArtistId(artistId: string) {
    return await db("artist")
      .where({ artist_id: artistId })
      .first();
  }

  async create(artist: Artist) {
    const [created] = await db("artist")
      .insert(artist)
      .returning("*");

    return created;
  }

  /*
   * Garante que o artista existe no banco local.
   * Se já existir (pelo artist_id do Spotify), retorna o registro existente.
   * Se não existir, cria e retorna o novo registro.
   */
  async findOrCreate(artist: Artist) {
    const existing = await this.findByArtistId(artist.artist_id);
    if (existing) return existing;

    return await this.create(artist);
  }
}