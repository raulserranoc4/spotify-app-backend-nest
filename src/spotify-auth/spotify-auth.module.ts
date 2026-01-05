import { Module } from '@nestjs/common';
import { SpotifyAuthController } from './spotify-auth.controller';
import { SpotifyAuthService } from './spotify-auth.service';

@Module({
  controllers: [SpotifyAuthController],
  providers: [SpotifyAuthService],
})
export class SpotifyAuthModule {}
