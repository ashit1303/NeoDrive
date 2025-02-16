import { Injectable } from '@nestjs/common';
import * as SonicChannel from 'sonic-channel';

@Injectable()
export class SearchService {
  private sonicClient = new SonicChannel.Search({
    host: 'localhost',
    port: 1491,
    auth: 'SecretPassword',
  });

  async search(query: string): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.sonicClient.query('files', 'default', query)
        .then((results) => resolve(results))
        .catch((err) => reject(err));
    });
  }
}