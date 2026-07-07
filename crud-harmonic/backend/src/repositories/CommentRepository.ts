import { db } from "../database/connection";
import { Comment } from "../models/Comments";

export class CommentRepository{
    async create(data: Comment ): Promise<Comment>{
        const [created] = await db<Comment>("comments")
        .insert(data)
        .returning("*")

        return created;
    }


    async findById(id: number): Promise<Comment | undefined>{
        return await db<Comment>("comments")
        .where({id})
        .first();
    }

      // lista comentários de uma review, já trazendo username do autor
  async findByReview(reviewId: number) {
    return await db("comments as c")
      .join("users as u", "c.user_id", "u.id")
      .where("c.review_id", reviewId)
      .select(
        "c.id",
        "c.text",
        "c.create_time",
        "u.id as user_id",
        "u.username",
        "u.photo_url"
      )
      .orderBy("c.create_time", "asc");
  }
   
  async update(id: number, text: string): Promise<Comment> {
    const [updated] = await db<Comment>("comments")
      .where({ id })
      .update({ text })
      .returning("*");
 
    return updated;
  }
 
  async delete(id: number): Promise<void> {
    await db("comments").where({ id }).delete();
  }
 
  async countByReview(reviewId: number): Promise<number> {
    const result = await db("comments")
      .where({ review_id: reviewId })
      .count("id as count")
      .first();
 
    return Number(result?.count ?? 0);
  }
}