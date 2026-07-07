import { Router } from "express";
import { ReviewController } from "../controllers/ReviewController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

const controller = new ReviewController();

router.post("/reviews", controller.create);
router.get("/reviews", controller.findAll);
router.get("/reviews/feed", controller.findFeed);

// só o dono da review (ou um admin) pode editar/excluir, checagem feita no controller,
// pois o :id da rota é o id da review, não o id do usuário
router.patch("/reviews/:id", authMiddleware, controller.update);
router.delete("/reviews/:id", authMiddleware, controller.delete);

export default router;
