import { Router } from "express";
import { FavoriteController } from "../controllers/favoriteController";


const router =  Router();
const controller = new FavoriteController();

router.post("/favorites",controller.add);
router.delete("/favorites/:userId/:musicId", controller.remove);
router.get("/favorites/:userId", controller.listByUser);

export default router;
