import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SpotifyModule } from './spotify/spotify.module';
import { SpotifyAuthModule } from './spotify-auth/spotify-auth.module';
import { RecordAnalysisModule } from './record-analysis/record-analysis.module';

@Module({
  imports: [SpotifyModule, SpotifyAuthModule, RecordAnalysisModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
