import { Router } from "express";
import { AlbumController } from "../controllers/AlbumController";

const router = Router();
const controller = new AlbumController();

router.get("/albums/:id", controller.getById);

export default router;
