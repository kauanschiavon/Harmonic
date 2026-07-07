import { Router } from "express";
import { SongController } from "../controllers/SongController";

const router = Router();
const controller = new SongController();

router.get("/songs/:id", controller.getById);

export default router;
