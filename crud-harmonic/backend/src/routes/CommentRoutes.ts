import { Router } from "express";
import { CommentController } from "../controllers/CommentController";

const router = Router();
const controller = new CommentController();

// lista comentários de uma review
router.get   ("/reviews/:reviewId/comments", controller.listByReview);

// cria comentário numa review
router.post  ("/reviews/:reviewId/comments", controller.create);

// edita ou exclui um comentário específico
router.patch ("/comments/:id", controller.update);
router.delete("/comments/:id", controller.delete);

export default router;