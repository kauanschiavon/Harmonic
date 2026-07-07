import { ReviewRepository } from "../repositories/ReviewRepository";
import { ArtistRepository } from "../repositories/ArtistRepository";
import { MusicRepository } from "../repositories/MusicRepository";
import { reviewSchema } from "../schemas/ReviewSchema";
import { getArtist, getTrack } from "./spotifyService";

const reviewRepository = new ReviewRepository();
const artistRepository = new ArtistRepository();
const musicRepository = new MusicRepository();

export const reviewService = {

  async create(data: unknown) {
    const validatedData = reviewSchema.parse(data);

    // Garante que o artista existe na tabela local "artist" (busca no Spotify se precisar criar)
    let artist = await artistRepository.findByArtistId(validatedData.artist_id);

    if (!artist) {
      const spotifyArtist = await getArtist(validatedData.artist_id);

      artist = await artistRepository.create({
        artist_id: validatedData.artist_id,
        name: spotifyArtist.name,
        photo_url: spotifyArtist.images?.[0]?.url ?? "",
      });
    }

    // Se a review também referencia uma música, garante que ela existe na tabela local "music"
    if (validatedData.music_id) {
      const music = await musicRepository.findByMusicId(validatedData.music_id);

      if (!music) {
        const spotifyTrack = await getTrack(validatedData.music_id);

        await musicRepository.create({
          music_id: validatedData.music_id,
          title: spotifyTrack.name,
          duration_ms: spotifyTrack.duration_ms,
          release_date: spotifyTrack.album?.release_date,
        });
      }
    }

    return await reviewRepository.create({
      user_id: validatedData.user_id,
      text: validatedData.text,
      note: validatedData.note,
      artist_id: validatedData.artist_id,
      music_id: validatedData.music_id ?? null,
    });
  },

  async findAll() {
    return await reviewRepository.findAll();
  },

  // Feed de reviews de todos os usuários, com autor, artista e música (página de Reviews)
  async getFeed() {
    return await reviewRepository.findAllWithAuthors();
  },

  async findAllWithAuthors() {
    return await reviewRepository.findAllWithAuthors();
  },

  async findById(id: number) {
    const review = await reviewRepository.findById(id);
    if (!review) throw new Error("Review não encontrada");
    return review;
  },

  async update(id: number, data: any) {
    return await reviewRepository.update(id, data);
  },

  async delete(id: number) {
    return await reviewRepository.delete(id);
  },
};
