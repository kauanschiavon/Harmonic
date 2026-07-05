import { db } from "../database/connection";
import { Review } from "../models/Review";

export class ReviewRepository {

  async create(review: Review) {
    return await db("reviews")
    .insert(review)
    .returning("*");
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
