import { getTrack } from "./spotifyService";
import { ReviewRepository } from "../repositories/ReviewRepository";

const reviewRepository = new ReviewRepository();

export class SongService {

  static async getSongDetail(spotifyTrackId: string) {
    const track = await getTrack(spotifyTrackId);

    if (!track || track.error) {
      throw new Error("Música não encontrada no Spotify");
    }

    const reviews = await reviewRepository.findByMusicIdWithAuthors(spotifyTrackId);

    const total_reviews = reviews.length;
    const avg_rating = total_reviews > 0
      ? reviews.reduce((sum: number, r: any) => sum + Number(r.note), 0) / total_reviews
      : null;

    // quantas reviews existem para cada nota de 1 a 5 estrelas
    const rating_distribution: Record<1 | 2 | 3 | 4 | 5, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const r of reviews as any[]) {
      const rounded = Math.min(5, Math.max(1, Math.round(Number(r.note)))) as 1 | 2 | 3 | 4 | 5;
      rating_distribution[rounded] += 1;
    }

    return {
      music_id: spotifyTrackId,
      title: track.name,
      artist: track.artists?.[0]?.name ?? "Artista desconhecido",
      artist_id: track.artists?.[0]?.id,
      album: track.album?.name,
      cover: track.album?.images?.[0]?.url,
      duration_ms: track.duration_ms,
      track_number: track.track_number,
      release_date: track.album?.release_date,
      spotify_url: track.external_urls?.spotify,
      avg_rating,
      total_reviews,
      rating_distribution,
      reviews,
    };
  }
}
