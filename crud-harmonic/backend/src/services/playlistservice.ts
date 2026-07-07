import { PlaylistRepository } from "../repositories/PlaylistRepository";
import { MusicRepository } from "../repositories/MusicRepository";
import {
  createPlaylistSchema,
  updatePlaylistSchema,
  addMusicSchema,
  reorderSchema,
} from "../schemas/PlaylistSchema";

export class PlaylistService {
  private static repository = new PlaylistRepository();
  private static musicRepository = new MusicRepository();

  static async create(data: unknown) {
    const validated = createPlaylistSchema.parse(data);

    return await PlaylistService.repository.create(validated);
  }

  static async listByUser(userId: number) {
    return await PlaylistService.repository.findByUser(userId);
  }

  // feed público
  static async findAll() {
    return await PlaylistService.repository.findAllWithAuthors();
  }

  static async getById(id: number) {
    const playlist = await PlaylistService.repository.findById(id);
    if (!playlist) throw new Error("Playlist não encontrada");

    const musics = await PlaylistService.repository.listMusics(id);

    return { ...playlist, musics };
  }

  static async update(id: number, data: unknown) {
    const validated = updatePlaylistSchema.parse(data);

    const playlist = await PlaylistService.repository.findById(id);
    if (!playlist) throw new Error("Playlist não encontrada");

    return await PlaylistService.repository.update(id, validated);
  }

  static async delete(id: number, userId: number) {
    const playlist = await PlaylistService.repository.findById(id);
    if (!playlist) throw new Error("Playlist não encontrada");

    if (playlist.user_id !== userId) {
      throw new Error("Sem permissão para excluir esta playlist");
    }

    await PlaylistService.repository.delete(id);
    return { message: "Playlist excluída com sucesso" };
  }

  static async addMusic(playlistId: number, data: unknown) {
    const validated = addMusicSchema.parse(data);

    const playlist = await PlaylistService.repository.findById(playlistId);
    if (!playlist) throw new Error("Playlist não encontrada");

    // garante que a música existe no banco local
    await PlaylistService.musicRepository.findOrCreate({
      music_id: validated.music_id,
      title: validated.title ?? "Título desconhecido",
      duration_ms: validated.duration_ms,
    });

    const existing = await PlaylistService.repository.findMusic(
      playlistId,
      validated.music_id
    );
    if (existing) throw new Error("Música já está nesta playlist");

    const lastPosition = await PlaylistService.repository.getLastPosition(playlistId);
    const position = validated.position ?? lastPosition + 1;

    return await PlaylistService.repository.addMusic(
      playlistId,
      validated.music_id,
      position
    );
  }

  static async removeMusic(playlistId: number, musicId: string) {
    const playlist = await PlaylistService.repository.findById(playlistId);
    if (!playlist) throw new Error("Playlist não encontrada");

    const existing = await PlaylistService.repository.findMusic(playlistId, musicId);
    if (!existing) throw new Error("Música não encontrada nesta playlist");

    await PlaylistService.repository.removeMusic(playlistId, musicId);
    return { message: "Música removida da playlist" };
  }

  static async reorder(playlistId: number, data: unknown) {
    const validated = reorderSchema.parse(data);

    const playlist = await PlaylistService.repository.findById(playlistId);
    if (!playlist) throw new Error("Playlist não encontrada");

    await PlaylistService.repository.reorder(playlistId, validated.order);
    return { message: "Ordem atualizada com sucesso" };
  }
}