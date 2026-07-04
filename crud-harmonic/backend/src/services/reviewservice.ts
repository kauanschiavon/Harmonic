import { ReviewRepository } from "../repositories/ReviewRepository";
import { ArtistRepository } from "../repositories/ArtistRepository";
import { reviewSchema } from "../schemas/ReviewSchema";
import { getArtist } from "./spotifyService";

export class ReviewService {
  private static repository = new ReviewRepository();
  private static artistRepository = new ArtistRepository();

  static async create(data: unknown) {
    const validatedData = reviewSchema.parse(data);

    if (!validatedData.music_id && !validatedData.artist_id) {
      throw new Error("Informe music_id ou artist_id");
    }

    // Se a review referencia um artista, garante que ele existe no banco local
    // antes de salvar (busca no Spotify se ainda não tivermos esse artist_id).
    if (validatedData.artist_id) {
      const existingArtist = await ReviewService.artistRepository.findByArtistId(
        validatedData.artist_id
      );

      if (!existingArtist) {
        const spotifyArtist = await getArtist(validatedData.artist_id);

        await ReviewService.artistRepository.create({
          artist_id: spotifyArtist.id,
          name: spotifyArtist.name,
          photo_url: spotifyArtist.images?.[0]?.url ?? "",
        });
      }
    }

    return await ReviewService.repository.create(validatedData);
  }

  static async findAll() {
    return await ReviewService.repository.findAll();
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