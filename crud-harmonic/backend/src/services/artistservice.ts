import { ArtistRepository } from "../repositories/ArtistRepository";
import { getArtist, getArtistAlbums } from "./spotifyService";

export class ArtistService {
  private static repository = new ArtistRepository();

  // Garante que o artista existe na tabela local "artist" (busca no Spotify se precisar criar)
  static async getProfile(artistId: string) {
    let artist = await ArtistService.repository.findByArtistId(artistId);

    if (!artist) {
      const spotifyArtist = await getArtist(artistId);

      artist = await ArtistService.repository.create({
        artist_id: artistId,
        name: spotifyArtist.name,
        photo_url: spotifyArtist.images?.[0]?.url ?? "",
      });
    }

    return artist;
  }

  // Discografia (álbuns e singles) do artista, vinda diretamente do Spotify
  static async getDiscography(artistId: string) {
    // garante que o artista existe localmente antes de buscar a discografia
    await ArtistService.getProfile(artistId);

    const data = await getArtistAlbums(artistId);

    // O Spotify pode repetir o mesmo álbum em mercados diferentes; removemos duplicados pelo nome
    const seen = new Set<string>();

    const albums = data.items
      .filter((album: any) => {
        if (seen.has(album.name)) return false;
        seen.add(album.name);
        return true;
      })
      .map((album: any) => ({
        id: album.id,
        name: album.name,
        image: album.images?.[0]?.url,
        releaseDate: album.release_date,
        albumType: album.album_type,
        totalTracks: album.total_tracks,
        spotifyUrl: album.external_urls.spotify,
      }))
      .sort((a: any, b: any) => (a.releaseDate < b.releaseDate ? 1 : -1));

    return albums;
  }
}
