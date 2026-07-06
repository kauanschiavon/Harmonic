import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { getTrack } from "../services/spotifyService"
import { db } from "../database/connection"

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
      image: track.album.images?.[0]?.url,
      spotifyUrl: track.external_urls.spotify
    }))
  });
});
router.get("/songs/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // busca detalhes da música no Spotify
    const track = await getTrack(id);

    // busca reviews do banco local
    const reviews = await db("reviews as r")
      .join("users as u", "r.user_id", "u.id")
      .where("r.music_id", id)
      .select(
        "r.id",
        "r.note",
        "r.text",
        "r.create_time",
        "u.id as user_id",
        "u.username",
        "u.photo_url"
      )
      .orderBy("r.create_time", "desc")
      .limit(10);

    // calcula média e total de avaliações
    const stats = await db("reviews")
      .where("music_id", id)
      .avg("note as avg_rating")
      .count("id as total_reviews")
      .first();

    return res.json({
      // dados do Spotify
      music_id:     track.id,
      title:        track.name,
      artist:       track.artists[0]?.name,
      artist_id:    track.artists[0]?.id,
      album:        track.album.name,
      album_id:     track.album.id,
      cover:        track.album.images?.[0]?.url,
      duration_ms:  track.duration_ms,
      track_number: track.track_number,
      release_date: track.album.release_date,
      spotify_url:  track.external_urls.spotify,

      // dados do banco local
      avg_rating:    stats?.avg_rating ? Number(Number(stats.avg_rating).toFixed(1)) : null,
      total_reviews: Number(stats?.total_reviews ?? 0),
      reviews,
    });

  } catch (error) {
    return res.status(404).json({
      message: error instanceof Error ? error.message : "Música não encontrada"
    });
  }
});

// rota consultar dados do artista(implementar) router.get("artist/:id) 

router.post("/users", controller.create);

router.post("/login", controller.login)

router.post("/forgot-password", controller.forgotPassword)

router.post("/reset-password", controller.resetPassword)

router.get("/users", controller.findAll);

// perfil público de qualquer usuário (visível para outros usuários)
router.get("/users/:id", controller.getProfile);

router.patch("/users/:id", controller.update);

router.delete("/users/:id", controller.delete);

export default router;