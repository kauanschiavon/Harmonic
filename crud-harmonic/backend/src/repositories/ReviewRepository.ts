import { db } from "../database/connection";
import { Review } from "../models/Review";

export class ReviewRepository {

  async create(review: Review) {
    const [created] = await db("reviews")
    .insert(review)
    .returning("*");
    return created;
  }

  async findAll() {
    return await db("reviews")
    .select("*");
  }

  async findById(id: number) {
    return await db("reviews")
    .where({ id })
    .first();
  }

  // Reviews feitas por um usuário 
  async findByUserId(userId: number) {
    return await db("reviews")
    .where({ user_id: userId })
    .orderBy("create_time", "desc");
  }

  // Reviews de um usuário específico
  async findByUserIdWithDetails(userId: number) {
    return await db("reviews")
      .leftJoin("artist", "reviews.artist_id", "artist.artist_id")
      .leftJoin("music", "reviews.music_id", "music.music_id")
      .where("reviews.user_id", userId)
      .select(
        "reviews.id",
        "reviews.user_id",
        "reviews.music_id",
        "reviews.artist_id",
        "reviews.note",
        "reviews.text",
        "reviews.create_time",
        "artist.name as artist_name",
        "music.title as music_title"
      )
      .orderBy("reviews.create_time", "desc");
  }

  // Verifica se o usuário já avaliou essa música 
  async findByUserAndTarget(userId: number, artistId: string, musicId?: string | null) {
    const query = db("reviews").where({ user_id: userId, artist_id: artistId });

    if (musicId) {
      query.andWhere({ music_id: musicId });
    } else {
      query.andWhere({ music_id: null });
    }

    return await query.first();
  }

  // Feed de reviews de todos os usuários, com dados do autor, artista e música
  async findAllWithAuthors() {
    return await db("reviews")
      .join("users", "reviews.user_id", "users.id")
      .leftJoin("artist", "reviews.artist_id", "artist.artist_id")
      .leftJoin("music", "reviews.music_id", "music.music_id")
      .select(
        "reviews.id",
        "reviews.user_id",
        "reviews.music_id",
        "reviews.artist_id",
        "reviews.note",
        "reviews.text",
        "reviews.create_time",
        "users.username",
        "users.photo_url as user_photo",
        "artist.name as artist_name",
        "artist.photo_url as artist_photo",
        "music.title as music_title"
      )
      .orderBy("reviews.create_time", "desc");
  }

  // Reviews de uma música específica
  async findByMusicIdWithAuthors(musicId: string) {
    return await db("reviews")
      .join("users", "reviews.user_id", "users.id")
      .where("reviews.music_id", musicId)
      .select(
        "reviews.id",
        "reviews.user_id",
        "reviews.note",
        "reviews.text",
        "reviews.create_time",
        "users.username",
        "users.photo_url"
      )
      .orderBy("reviews.create_time", "desc");
  }

  async update(id: number, data: Partial<Review>) {
    const [updated] = await db("reviews")
      .where({ id })
      .update(data)
      .returning("*");
    return updated;
  }

  async delete(id: number) {
    return await db("reviews")
    .where({ id })
    .delete();
  }
}
