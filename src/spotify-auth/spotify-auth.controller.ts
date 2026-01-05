import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { SpotifyAuthService } from './spotify-auth.service';

@Controller('spotify-auth')
export class SpotifyAuthController {
  constructor(private readonly spotifyAuthService: SpotifyAuthService) {}

  // 🔹 1️⃣ Route to ask authentication with Spotify
  @Get('login')
  private async getLoginUrl() {
    const url = this.spotifyAuthService.getAuthUrl();
    return url;
  }

  // 🔹 2️⃣ Route to manage callback and obtain token
  @Get('callback')
  async callback(@Query('code') code: string) {
    if (!code) {
      throw new BadRequestException('Código no proporcionado');
    }

    return this.spotifyAuthService.getAccessToken(code);
  }
}
