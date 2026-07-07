import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware, adminMiddleware, ownerOrAdminMiddleware } from "../middlewares/authMiddleware";

const router = Router();

const controller = new UserController();

import { searchSpotify } from "../services/spotifyService"

router.get("/search", async (req, res) => {
  const { q } = req.query as { q: string };

  if (!q) {
    return res.status(400).json({
      error: "Parâmetro q obrigatório"
    });
  }

  const results = await searchSpotify(q);

  return res.json({
    artists: results.artists?.items.map((artist: any) => ({
      id: artist.id,
      name: artist.name,
      image: artist.images?.[0]?.url,
      spotifyUrl: artist.external_urls.spotify
    })),

    albums: results.albums?.items.map((album: any) => ({
      id: album.id,
      name: album.name,
      image: album.images?.[0]?.url,
      releaseDate: album.release_date,
      artist: album.artists?.[0]?.name,
      artistId: album.artists?.[0]?.id
    })),

    tracks: results.tracks?.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name,
      artistId: track.artists[0]?.id,
      album: track.album.name,
      image: track.album.images?.[0]?.url,
      spotifyUrl: track.external_urls.spotify
    }))
  });
});

// rota consultar dados do artista(implementar) router.get("artist/:id) 

router.post("/users", controller.create);

router.post("/login", controller.login)

router.post("/forgot-password", controller.forgotPassword)

router.post("/reset-password", controller.resetPassword)

// lista completa de usuários (com email) só pode ser vista por admins
router.get("/users", authMiddleware, adminMiddleware, controller.findAll);

// perfil público de qualquer usuário (visível para outros usuários)
router.get("/users/:id", controller.getProfile);

// só o dono da conta (ou um admin) pode editar
router.patch("/users/:id", authMiddleware, ownerOrAdminMiddleware, controller.update);

// só admin pode excluir usuários
router.delete("/users/:id", authMiddleware, adminMiddleware, controller.delete);

export default router;