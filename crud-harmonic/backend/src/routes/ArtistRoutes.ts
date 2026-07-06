import { Router } from "express";
import { ArtistController } from "../controllers/ArtistController";

const router = Router();
const controller = new ArtistController();

router.get("/artists/:id", controller.getProfile);
router.get("/artists/:id/discography", controller.getDiscography);

export default router;