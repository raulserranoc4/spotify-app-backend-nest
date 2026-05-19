import {
  Body,
  Controller,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RecordAnalysisService } from './record-analysis.service';

@Controller('record-analysis')
export class RecordAnalysisController {
  constructor(private readonly recordAnalysisService: RecordAnalysisService) {}

  // 🔹 Upload de ZIP con historial
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new UnauthorizedException('No se subió ningún archivo');
    }

    const token = this.getAuthorizationToken(req);

    const analysis = await this.recordAnalysisService.analiyzeFile(
      file.buffer,
      token,
    );
    return analysis;
  }

  @Post('analyze-artist')
  @UseInterceptors(FileInterceptor('file'))
  async analyzeArtist(@Req() req: any, @UploadedFile() file: Express.Multer.File, @Body('artist') artist: string) {

    if (!file) {
      throw new UnauthorizedException('No se subió ningún archivo');
    }

    const token = this.getAuthorizationToken(req);

    if (!artist) {
      throw new UnauthorizedException('No se proporcionó ningún artista');
    }

    const artistParsed = JSON.parse(artist);

    const analysis = await this.recordAnalysisService.analyzeArtist(
      file.buffer,
      token,
      artistParsed
    );
    return analysis;
  }

  private getAuthorizationToken(req: any): string | undefined {
    const authorization = req.headers.authorization;
    if (!authorization) return undefined;

    const token = authorization.replace(/^Bearer\s+/i, '').trim();
    return token || undefined;
  }
}
