import { Router } from "express";
import { ReviewController } from "../controllers/ReviewController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

const controller = new ReviewController();

router.post("/reviews", controller.create);
router.get("/reviews", controller.findAll);
router.get("/reviews/feed", controller.findFeed);

// só o dono da review pode editar/excluir
router.patch("/reviews/:id", authMiddleware, controller.update);
router.delete("/reviews/:id", authMiddleware, controller.delete);

export default router;
