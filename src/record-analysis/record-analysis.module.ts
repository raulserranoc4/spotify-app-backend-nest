import { Module } from '@nestjs/common';
import { RecordAnalysisService } from './record-analysis.service';
import { RecordAnalysisController } from './record-analysis.controller';
import { SpotifyService } from 'src/spotify/spotify.service';

@Module({
  controllers: [RecordAnalysisController],
  providers: [RecordAnalysisService, SpotifyService],
  imports: [],
})
export class RecordAnalysisModule {}
