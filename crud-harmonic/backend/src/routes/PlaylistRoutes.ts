import { Router } from "express";
import { PlaylistController } from "../controllers/PlaylistController";

const router = Router();
const controller = new PlaylistController();

router.post("/playlists", controller.create);
router.get("/playlists", controller.findAll);
router.get("/playlists/:id", controller.findById);
router.get("/users/:userId/playlists", controller.findByUser);
router.patch("/playlists/:id", controller.update);
router.delete("/playlists/:id", controller.delete);

// álbuns dentro de uma playlist
router.post("/playlists/:id/albums", controller.addAlbum);
router.delete("/playlists/:id/albums/:spotifyAlbumId", controller.removeAlbum);

export default router;
