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
