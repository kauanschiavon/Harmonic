import { getAlbum } from "./spotifyService";

export class AlbumService {

  // Busca detalhes de um álbum no Spotify, incluindo a lista de faixas
  static async getAlbumDetail(spotifyAlbumId: string) {
    const album = await getAlbum(spotifyAlbumId);

    if (!album || album.error) {
      throw new Error("Álbum não encontrado no Spotify");
    }

    return {
      album_id: album.id,
      name: album.name,
      cover: album.images?.[0]?.url,
      release_date: album.release_date,
      artist: album.artists?.[0]?.name ?? "Artista desconhecido",
      artist_id: album.artists?.[0]?.id,
      total_tracks: album.total_tracks,
      tracks: (album.tracks?.items ?? []).map((track: any) => ({
        id: track.id,
        name: track.name,
        track_number: track.track_number,
        duration_ms: track.duration_ms,
      })),
    };
  }
}
