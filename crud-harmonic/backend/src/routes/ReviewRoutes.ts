import { Router } from "express";
import { ReviewController } from "../controllers/ReviewController";

const router = Router();

const controller = new ReviewController();

router.post("/reviews", controller.create);
router.get("/reviews", controller.findAll);
router.get("/reviews/feed", controller.findFeed);
router.patch("/reviews/:id", controller.update);
router.delete("/reviews/:id", controller.delete);

export default router;
