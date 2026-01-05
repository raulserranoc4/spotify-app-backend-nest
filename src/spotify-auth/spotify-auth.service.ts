import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import querystring from 'querystring';

@Injectable()
export class SpotifyAuthService {
  private readonly CLIENT_ID = process.env.SPOTIFY_CLIENT_ID as string;
  private readonly CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET as string;
  private readonly REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI as string;

  getAuthUrl(): { url: string } {
    const scope =
      'user-read-private user-read-email user-read-recently-played user-top-read';
    const authUrl = `https://accounts.spotify.com/authorize?${querystring.stringify(
      {
        response_type: 'code',
        client_id: this.CLIENT_ID,
        scope,
        redirect_uri: this.REDIRECT_URI,
      },
    )}`;

    return { url: authUrl };
  }

  async getAccessToken(code: string): Promise<any> {
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        querystring.stringify({
          code,
          redirect_uri: this.REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${this.CLIENT_ID}:${this.CLIENT_SECRET}`,
            ).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return response.data;
    } catch (error: any) {
      console.error(
        'Error intercambiando el código por token:',
        error.response?.data || error.message,
      );
      throw new InternalServerErrorException(
        'Error al obtener el token de Spotify',
      );
    }
  }
}
