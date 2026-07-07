import { Router } from "express";
import { PlaylistController } from "../controllers/PlaylistController";

const router = Router();
const controller = new PlaylistController();

router.post("/playlists", controller.create);
router.get("/playlists/user/:userId", controller.listByUser);
router.get("/playlists/:id", controller.getById);
router.patch("/playlists/:id", controller.update);
router.delete("/playlists/:id", controller.delete);         // fix: era /playlist/:id

router.post("/playlists/:id/musics", controller.addMusic);  // fix: era /:id/:musics
router.delete("/playlists/:id/musics/:musicId", controller.removeMusic);
router.patch("/playlists/:id/musics/reorder", controller.reorder);

export default router;
