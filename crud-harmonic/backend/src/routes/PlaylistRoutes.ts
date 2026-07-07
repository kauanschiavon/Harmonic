import { Router } from "express";
import { PlaylistController } from "../controllers/PlaylistController";

const router = Router();
const controller = new PlaylistController();

//playlist
router.post("/playlists", controller.create);
router.get("/playlists", controller.findAll);
router.get("/playlists/user/:userId", controller.listByUser);
router.get("/playlists/:id", controller.getById);
router.patch("/playlists/:id", controller.update);
router.delete("/playlists/:id", controller.delete);


//musica da playlist
router.post("/playlists/:id/:musics", controller.addMusic);
router.delete("/playlists/:id/musics/:musicId", controller.removeMusic);
router.patch("/playlists/:id/musics/reorder", controller.reorder);

export default router;