import { db } from "../database/connection";
import { ReviewLike } from "../models/ReviewLike";

export class ReviewLikeRepository {

  async create(userId: number, reviewId: number): Promise<ReviewLike> {
    const [created] = await db<ReviewLike>("review_likes")
      .insert({ user_id: userId, review_id: reviewId })
      .returning("*");

    return created;
  }

  async findOne(userId: number, reviewId: number): Promise<ReviewLike | undefined> {
    return await db<ReviewLike>("review_likes")
      .where({ user_id: userId, review_id: reviewId })
      .first();
  }

  async delete(userId: number, reviewId: number): Promise<void> {
    await db("review_likes")
      .where({ user_id: userId, review_id: reviewId })
      .delete();
  }

  async countByReview(reviewId: number): Promise<number> {
    const result = await db("review_likes")
      .where({ review_id: reviewId })
      .count("user_id as count")
      .first();

    return Number(result?.count ?? 0);
  }
}