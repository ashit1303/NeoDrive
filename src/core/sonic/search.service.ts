import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SonicChannel from 'sonic-channel';

@Injectable()
export class SearchService {
  constructor(private configService: ConfigService) {}
  private sonicClient = new SonicChannel.Search(
    {
    host: this.configService.get<string>('SONIC_HOST'),
    // port: this.configService.get<number>('SONIC_PORT') || 1491,
    auth: this.configService.get<string>('SONIC_PASSWORD'),
    // host: 'localhost',
    port: 1491,
    // auth: 'SecretPassword',
  });

  async search(query: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.sonicClient.query('files', 'default', query)
        .then((results) => resolve(results))
        .catch((err) => reject(err));
    });
  }
}