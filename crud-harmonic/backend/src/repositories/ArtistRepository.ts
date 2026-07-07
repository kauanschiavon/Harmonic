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


  async findOrCreate(artist: Artist) {
    const existing = await this.findByArtistId(artist.artist_id);
    if (existing) return existing;

    return await this.create(artist);
  }
}
