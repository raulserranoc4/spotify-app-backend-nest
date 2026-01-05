export interface SpotifyArtist {
  id: string;
  name: string;
}

export interface SpotifyAlbum {
  name: string;
  images: { url: string }[];
}

export interface SpotifyTrack {
  name: string;
  album: SpotifyAlbum;
  artists: SpotifyArtist[];
}

export interface RecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
}

export interface FirstTrackResult {
  name: string;
  album: string;
  albumImage?: string;
  playedAt: string;
}
