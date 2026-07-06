import { CommentRepository } from "../repositories/CommentRepository";
import { createCommentSchema, updateCommentSchema} from "../schemas/CommentsSchema"

export class CommentService {
  private static repository = new CommentRepository();

  static async create(data: unknown) {
    const validated = createCommentSchema.parse(data);
    return await CommentService.repository.create(validated);
  }

  static async listByReview(reviewId: number) {
    const comments = await CommentService.repository.findByReview(reviewId);
    const total = await CommentService.repository.countByReview(reviewId);

    return { total, comments };
  }

  static async update(id: number, userId: number, data: unknown) {
    const validated = updateCommentSchema.parse(data);

    const comment = await CommentService.repository.findById(id);
    if (!comment) throw new Error("Comentário não encontrado");

    // só o autor pode editar
    if (comment.user_id !== userId) {
      throw new Error("Sem permissão para editar este comentário");
    }

    return await CommentService.repository.update(id, validated.text);
  }

  static async delete(id: number, userId: number, userRole: string) {
    const comment = await CommentService.repository.findById(id);
    if (!comment) throw new Error("Comentário não encontrado");

    // autor ou admin podem excluir
    if (comment.user_id !== userId && userRole !== "admin") {
      throw new Error("Sem permissão para excluir este comentário");
    }

    await CommentService.repository.delete(id);
    return { message: "Comentário excluído com sucesso" };
  }
}