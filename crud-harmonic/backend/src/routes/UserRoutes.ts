import { Router } from "express";
import { UserController } from "../controllers/UserController";

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
      releaseDate: album.release_date
    })),

    tracks: results.tracks?.items.map((track: any) => ({
      id: track.id,
      name: track.name,
      artist: track.artists[0]?.name,
      album: track.album.name,
      spotifyUrl: track.external_urls.spotify
    }))
  });
});

router.post("/users", controller.create);

router.post("/login", controller.login)

router.get("/users", controller.findAll);

router.patch("/users/:id", controller.update);

router.delete("/users/:id", controller.delete);

export default router;