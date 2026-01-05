import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UnauthorizedException,
  Res,
} from '@nestjs/common';
import { SpotifyService } from './spotify.service';

@Controller('spotify')
export class SpotifyController {
  constructor(private readonly spotifyService: SpotifyService) {}

  // 🔹 Obtener perfil de usuario
  @Get('profile')
  async getProfile(@Req() req: any) {
    const token = req.headers.authorization;
    if (!token) throw new UnauthorizedException('No se proporcionó el token');
    return await this.spotifyService.getProfile(token);
  }

  // 🔹 Obtener playlists del usuario
  @Get('playlists')
  async getPlaylists(@Req() req: any) {
    const token = req.headers.authorization;
    if (!token) throw new UnauthorizedException('Token de acceso requerido');
    return await this.spotifyService.getPlaylists(token);
  }

  // 🔹 Primer track escuchado de un artista
  @Get('first-track/:artistId')
  async getFirstTrack(@Param('artistId') artistId: string, @Req() req: any) {
    const token = req.headers.authorization;
    if (!token) throw new UnauthorizedException('Token requerido');

    return await this.spotifyService.getFirstTrackByArtist(token, artistId);
  }

  // 🔹 Top tracks
  @Get('top-tracks')
  async getTopTracks(
    @Query('time_range') timeRange: string,
    @Query('limit') limit: number,
    @Req() req: any,
  ) {
    const token = req.headers.authorization;
    if (!token) throw new UnauthorizedException('Token requerido');

    const topTracks = await this.spotifyService.getTopTracks(
      token,
      timeRange,
      limit,
    );
    return { items: topTracks };
  }
}
