import { Router } from "express";
import { SpotifyController } from "../controllers/SpotifyController";

const router = Router();
const controller = new SpotifyController();

router.get("/search", controller.search);
router.get("/artists/:id", controller.findArtist);
router.get("/albums/:id", controller.findAlbum);

export default router;
