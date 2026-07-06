import { ReviewRepository } from "../repositories/ReviewRepository";
import { ArtistRepository } from "../repositories/ArtistRepository";
import { MusicRepository } from "../repositories/MusicRepository";
import { reviewSchema } from "../schemas/ReviewSchema";
import { getArtist, getTrack } from "./spotifyService";

export class ReviewService {
  private static repository = new ReviewRepository();
  private static artistRepository = new ArtistRepository();
  private static musicRepository = new MusicRepository();

  static async create(data: unknown) {
    const validatedData = reviewSchema.parse(data);

    // Garante que o artista existe na tabela local "artist" (busca no Spotify se precisar criar)
    let artist = await ReviewService.artistRepository.findByArtistId(validatedData.artist_id);

    if (!artist) {
      const spotifyArtist = await getArtist(validatedData.artist_id);

      artist = await ReviewService.artistRepository.create({
        artist_id: validatedData.artist_id,
        name: spotifyArtist.name,
        photo_url: spotifyArtist.images?.[0]?.url ?? "",
      });
    }

    // Se a review também referencia uma música, garante que ela existe na tabela local "music"
    if (validatedData.music_id) {
      const music = await ReviewService.musicRepository.findByMusicId(validatedData.music_id);

      if (!music) {
        const spotifyTrack = await getTrack(validatedData.music_id);

        await ReviewService.musicRepository.create({
          music_id: validatedData.music_id,
          title: spotifyTrack.name,
          duration_ms: spotifyTrack.duration_ms,
          release_date: spotifyTrack.album?.release_date,
        });
      }
    }

    return await ReviewService.repository.create({
      user_id: validatedData.user_id,
      text: validatedData.text,
      note: validatedData.note,
      artist_id: validatedData.artist_id,
      music_id: validatedData.music_id ?? null,
    });
  }

  static async findAll() {
    return await ReviewService.repository.findAll();
  }

  static async findAllWithAuthors() {
    return await ReviewService.repository.findAllWithAuthors();
  }

  static async update(id: number, data: any) {
    return await ReviewService.repository.update(id, data);
  }

  static async delete(id: number) {
    return await ReviewService.repository.delete(id);
  }

  static async findById(id: number) {
    const review = await ReviewService.repository.findById(id);
    if (!review) throw new Error("Review não encontrada");
    return review;
  }
}
