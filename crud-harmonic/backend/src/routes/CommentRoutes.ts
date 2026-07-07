import { Router } from "express";
import { CommentController } from "../controllers/CommentController";

const router = Router();
const controller = new CommentController();

router.get   ("/reviews/:reviewId/comments", controller.listByReview);

router.post  ("/reviews/:reviewId/comments", controller.create);

router.patch ("/comments/:id", controller.update);
router.delete("/comments/:id", controller.delete);

export default router;