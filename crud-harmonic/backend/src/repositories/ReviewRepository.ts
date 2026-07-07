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

  // Reviews feitas por um usuário específico (usado no perfil público)
  async findByUserId(userId: number) {
    return await db("reviews")
    .where({ user_id: userId })
    .orderBy("create_time", "desc");
  }

  // Feed de reviews de todos os usuários, com dados do autor, artista e música (usado na página de Reviews)
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

  // Reviews de uma música específica, com dados do autor (usado na SongPage)
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
    return await db("reviews")
    .where({ id })
    .update(data);

  }

  async delete(id: number) {
    return await db("reviews")
    .where({ id })
    .delete();
  }
}
