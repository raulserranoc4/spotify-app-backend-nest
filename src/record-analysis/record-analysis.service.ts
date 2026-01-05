import { Injectable } from '@nestjs/common';
import AdmZip from 'adm-zip';
import { ArtistAnalysis, TrackEntry, TrackYear } from './dto/record.dto';
import { SpotifyService } from 'src/spotify/spotify.service';

@Injectable()
export class RecordAnalysisService {
  constructor(private readonly spotifyService: SpotifyService) {}

  public async analiyzeFile(zipBuffer: Buffer, token: string): Promise<any> {
    const allSongs: TrackEntry[] = this.getAllsongs(zipBuffer);


    const mostListenedArtist = await this.getMostListenedArtists(
      allSongs,
      token,
    );
    const mostListened10Artist = mostListenedArtist.slice(0, 10);

    const mostListenedTracks = await this.getMostListenedTracks(
      allSongs,
      token,
    );

    const mostListened10Tracks = mostListenedTracks.slice(0, 10);

    const yearsInfo = this.getYearsInfo(
      allSongs
    );

    const monthsInfo = this.getMonthsInfo(
      allSongs,
      token,
    );

    const totalArtists = mostListenedArtist.map(artist => {
        return {artistName:artist.artistName, trackID: artist.trackID}
    }).sort((a, b) => a.artistName.localeCompare(b.artistName));

    return { artists: mostListened10Artist, tracks: mostListened10Tracks, yearsInfo: yearsInfo, monthsInfo: monthsInfo, totalArtists: totalArtists };
  }

  private getAllsongs(zipBuffer: Buffer): TrackEntry[] {
    const zip = new AdmZip(zipBuffer);
    const entries = zip.getEntries();

    let allSongs: TrackEntry[] = [];
    entries.forEach((entry: any) => {
      if (
        !entry.isDirectory &&
        entry.name.startsWith('Streaming_History_Audio_')
      ) {
        try {
          const content = entry.getData().toString('utf8');
          const jsonData = JSON.parse(content);
          if (Array.isArray(jsonData)) {
            allSongs = allSongs.concat(jsonData);
          }
        } catch (error: any) {
          console.error(`Error procesando ${entry.name}:`, error.message);
        }
      }
    });
    return allSongs;
  }

  private async getMostListenedArtists(history: TrackEntry[], token: string) {
    // objeto acumulador
    const artistMap: Record<string, { time: number; trackUri: string }> = {};
    let i = 0;
    for (const entry of history) {
      const artist = entry.master_metadata_album_artist_name;

      if (Object.keys(artistMap).length === 2025) {
        const a = 0;
      }

      if (artist != undefined){
        const ms = entry.ms_played ?? 0;
        const track = entry.spotify_track_uri;

        if (!artistMap[artist]) {
          artistMap[artist] = { time: 0, trackUri: track };
        }

        artistMap[artist].time += ms / 1000; // to seconds
      }
    }

    // convertir a array y ordenar
    let ranking = Object.entries(artistMap)
      .map(([artist, data]) => ({
        artistName: artist,
        time: data.time,
        trackID: data.trackUri.replace('spotify:track:', ''),
      }))
      .sort((a, b) => b.time - a.time);

    let firstArtistTrack = await this.spotifyService.getTrack(
      token,
      ranking[0].trackID,
    );

    firstArtistTrack.time = ranking[0].time;
    firstArtistTrack.trackID = ranking[0].trackID;
    firstArtistTrack.artistName = ranking[0].artistName;


    ranking[0] = await this.spotifyService.getArtist(
      token,
      firstArtistTrack.artists.find(
        (artist) => (artist.name = ranking[0].artistName),
      ).id,
    );

    ranking[0].time = firstArtistTrack.time;
    ranking[0].trackID = firstArtistTrack.trackID;
    ranking[0].artistName = firstArtistTrack.artistName;

    return ranking;
  }

  private async getMostListenedTracks(history: TrackEntry[], token: string) {
    // objeto acumulador
    const trackMap: Record<string, { time: number; trackID: string }> = {};

    for (const entry of history) {
      if (entry.spotify_track_uri) {
        const trackName = entry.master_metadata_track_name;
        const ms = entry.ms_played ?? 0;
        const trackID = entry.spotify_track_uri.replace('spotify:track:', '');

        if (!trackName) continue;

        if (!trackMap[trackName]) {
          trackMap[trackName] = { time: 0, trackID: trackID };
        }

        trackMap[trackName].time += ms / 1000; // convertir a segundos;;
      }
    }

    // convertir a array y ordenar
    let ranking = Object.entries(trackMap)
      .map(([trackName, data]) => ({
        trackName,
        time: data.time,
        trackID: data.trackID.replace('spotify:track:', ''),
      }))
      .sort((a, b) => b.time - a.time);

    let firstTrack = await this.spotifyService.getTrack(
      token,
      ranking[0].trackID,
    );

    firstTrack.time = ranking[0].time;

    ranking[0] = firstTrack;

    return ranking;
  }

  private getYearsInfo(history: TrackEntry[]): TrackYear[] {
    const trackMap: Record<string, { time: number }> = {};

    for (const entry of history) {
      if (entry.spotify_track_uri) {
        const trackYear = entry.ts.slice(0, 4); // get year from timestamp
        const ms = entry.ms_played ?? 0;

        if (!trackYear) continue;

        if (!trackMap[trackYear]) {
          trackMap[trackYear] = { time: 0 };
        }

        trackMap[trackYear].time += ms / 60000; // to minutes;
      }
    }

    // convertir a array y ordenar
    let ranking = Object.entries(trackMap)
      .map(([trackYear, data]) => ({
        trackYear,
        time: data.time,
      }))
      .sort((a, b) => Number(a.trackYear) - Number(b.trackYear));

    return ranking;
  }

  private getMonthsInfo(history: TrackEntry[], token: string) {
    const trackMap: Record<string, { time: number }> = {};

    for (const entry of history) {
      if (entry.spotify_track_uri) {
        const trackMonth = new Date(entry.ts).toLocaleString('es-ES', { month: 'long' }); // get month from timestamp
        const ms = entry.ms_played ?? 0;

        

        if (!trackMonth) continue;

        if (!trackMap[trackMonth]) {
          trackMap[trackMonth] = { time: 0 };
        }

        trackMap[trackMonth].time += ms / 60000; // to minutes
      }
    }

    // convertir a array y ordenar
    let ranking = Object.entries(trackMap)
      .map(([trackMonth, data]) => ({
        trackMonth,
        time: data.time,
      }))
      .sort((a, b) => Number(a.trackMonth) - Number(b.trackMonth));

    return ranking;
  }

  public async analyzeArtist(zipBuffer: Buffer, token: string, selectedArtist: any): Promise<ArtistAnalysis> {

    // 1. Minutos escuchados del artista
    // 2. 5 Canciones más escuchada del artista
    // 3. Álbum más escuchado del artista
    // 4. Primer canción escuchada del artista
    // 5. Primera vez que escuchaste al artista 

    const allSongs: TrackEntry[] = this.getAllsongs(zipBuffer);

    let firstArtistTrack = await this.spotifyService.getTrack(
      token,
      selectedArtist.trackID,
    );

    const spotifyArtist = await this.spotifyService.getArtist(
      token,
      firstArtistTrack.artists.find(
        (artist) => (artist.name = selectedArtist.artistName),
      ).id,
    );

    const artistTracks = allSongs
      .filter((entry) =>
        entry.master_metadata_album_artist_name === selectedArtist.artistName
      )

    const minutesListened = this.countMinutesListened(selectedArtist, allSongs);
    const firstTrackListened = this.getFirstTrackByArtist(artistTracks);
    const firstTimeListened = firstTrackListened ? new Date(firstTrackListened.ts).toLocaleDateString('es-ES') : "";
    const firstTrack = firstTrackListened?.master_metadata_track_name;
    const artistByYears: TrackYear[] = this.getYearsInfo(artistTracks);

    return {
      artistName: selectedArtist.artistName,
      artistImage: spotifyArtist.images[0]?.url,
      minutesListened,
      topTracks: [],
      firstTrack,
      firstTimeListened,
      artistByYears
    };
  }

  private countMinutesListened(artist: any, history: TrackEntry[]) {
    let totalMs = 0;

    for (const entry of history) {
      const entryArtist = entry.master_metadata_album_artist_name;  
      if (entryArtist === artist.artistName) {
        const ms = entry.ms_played ?? 0;
        totalMs += ms;
      }
    }

    return (totalMs / 60000).toFixed(0); // to minutes
  }

  private getFirstTrackByArtist(artistHistory: TrackEntry[]) {
    const artistTracks = artistHistory
      .sort(
        (a, b) =>
          new Date(a.ts).getTime() - new Date(b.ts).getTime(),
      );
    if (artistTracks.length === 0) return null;

    const firstTrack = artistTracks[0];
    return firstTrack;
  }
}

