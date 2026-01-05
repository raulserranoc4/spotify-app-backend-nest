import { Injectable, UnauthorizedException } from '@nestjs/common';
import {
  FirstTrackResult,
  RecentlyPlayedItem,
  SpotifyTrack,
} from './dto/spotify.dto';
import axios from 'axios';

@Injectable()
export class SpotifyService {
  constructor() {}

  public async getProfile(authorization: string) {
    if (!authorization) {
      throw new UnauthorizedException('No se proporcionó el token');
    }

    try {
      const response = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${authorization}`,
        },
      });

      return response.data;
    } catch (error: any) {
      throw new Error('Error al obtener perfil de usuario');
    }
  }

  public async getPlaylists(token: string) {
    try {
      const response = await axios.get(
        'https://api.spotify.com/v1/me/playlists',
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return response.data;
    } catch {
      throw new Error('Error al obtener playlists');
    }
  }

  // Recuperar la primera canción escuchada de un artista
  public async getFirstTrackByArtist(
    accessToken: string,
    artistId: string,
  ): Promise<FirstTrackResult | null> {
    try {
      let allHistory: RecentlyPlayedItem[] = [];
      let nextUrl =
        'https://api.spotify.com/v1/me/player/recently-played?limit=30';

      let lastTimestamp: number | null = null;

      while (nextUrl) {
        const response = await axios.get(nextUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const history: RecentlyPlayedItem[] = response.data.items;
        if (history.length === 0) break;

        allHistory = allHistory.concat(history);

        // Obtener el último timestamp para continuar la paginación
        lastTimestamp = new Date(
          history[history.length - 1].played_at,
        ).getTime();
        nextUrl = `https://api.spotify.com/v1/me/player/recently-played?limit=30&before=${lastTimestamp}`;

        console.log(`🔄 Obteniendo más canciones después de: ${lastTimestamp}`);
      }

      console.log(`✅ Se recuperaron ${allHistory.length} canciones en total.`);

      // Filtrar las reproducciones del artista seleccionado
      const artistTracks = allHistory
        .filter((item) =>
          item.track.artists.some((artist) => artist.id === artistId),
        )
        .sort(
          (a, b) =>
            new Date(a.played_at).getTime() - new Date(b.played_at).getTime(),
        );

      if (artistTracks.length === 0) return null;

      const firstTrack = artistTracks[0].track;
      return {
        name: firstTrack.name,
        album: firstTrack.album.name,
        albumImage: firstTrack.album.images[0]?.url,
        playedAt: artistTracks[0].played_at,
      };
    } catch (error: any) {
      console.error(
        '❌ Error en getFirstTrackByArtist:',
        error.response?.data || error.message,
      );
      return null;
    }
  }

  // 🔹 Obtener los tracks más escuchados
  public async getTopTracks(
    accessToken: string,
    timeRange: string = 'short_term',
    limit: number = 10,
  ): Promise<SpotifyTrack[]> {
    try {
      const response = await axios.get(
        'https://api.spotify.com/v1/me/top/tracks',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: { time_range: timeRange, limit },
        },
      );

      return response.data.items as SpotifyTrack[];
    } catch (error: any) {
      console.error(
        'Error en getTopTracks:',
        error.response?.data || error.message,
      );
      throw new Error('No se pudo obtener los tracks más escuchados.');
    }
  }

  public async getTrack(token: string, trackID: string) {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/tracks/${trackID}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return response.data;
    } catch {
      throw new Error('Error al obtener track');
    }
  }

  public async getArtist(token: string, artistID: string) {
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/artists/${artistID}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return response.data;
    } catch {
      throw new Error('Error al obtener artista');
    }
  }
}
