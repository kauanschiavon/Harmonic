import { ReviewLikeRepository } from "../repositories/ReviewlikeRepository";
import { ReviewRepository } from "../repositories/ReviewRepository";
import { reviewLikeSchema } from "../schemas/ReviewlikeSchema";

export class ReviewLikeService {
  private static repository = new ReviewLikeRepository();
  private static reviewRepository = new ReviewRepository();

  static async like(reviewId: number, data: unknown) {
    const { user_id } = reviewLikeSchema.parse(data);

    // review existe?
    const review = await ReviewLikeService.reviewRepository.findById(reviewId);
    if (!review) throw new Error("Review não encontrada");

    // usuário não pode curtir a própria review
    if (review.user_id === user_id) {
      throw new Error("Você não pode curtir sua própria review");
    }

    // já curtiu?
    const existing = await ReviewLikeService.repository.findOne(user_id, reviewId);
    if (existing) throw new Error("Você já curtiu esta review");

    await ReviewLikeService.repository.create(user_id, reviewId);

    const total = await ReviewLikeService.repository.countByReview(reviewId);
    return { message: "Review curtida com sucesso", total_likes: total };
  }

  static async unlike(reviewId: number, data: unknown) {
    const { user_id } = reviewLikeSchema.parse(data);

    // curtida existe?
    const existing = await ReviewLikeService.repository.findOne(user_id, reviewId);
    if (!existing) throw new Error("Você não curtiu esta review");

    await ReviewLikeService.repository.delete(user_id, reviewId);

    const total = await ReviewLikeService.repository.countByReview(reviewId);
    return { message: "Curtida removida com sucesso", total_likes: total };
  }

  static async countLikes(reviewId: number) {
    const review = await ReviewLikeService.reviewRepository.findById(reviewId);
    if (!review) throw new Error("Review não encontrada");

    const total = await ReviewLikeService.repository.countByReview(reviewId);
    return { review_id: reviewId, total_likes: total };
  }
}