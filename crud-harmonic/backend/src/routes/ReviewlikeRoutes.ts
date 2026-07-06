import { Router } from "express";
import { ReviewLikeController } from "../controllers/ReviewlikeController";

const router = Router();
const controller = new ReviewLikeController();

router.post  ("/reviews/:reviewId/like",   controller.like);
router.delete("/reviews/:reviewId/like",   controller.unlike);
router.get   ("/reviews/:reviewId/likes",  controller.countLikes);

export default router;