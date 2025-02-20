import { Injectable } from '@nestjs/common';
import { TypeormService } from 'src/core/typeorm/typeorm.service';
import { ShortendLinkDTO } from './shortener.dto';
import { ShortendLink } from 'src/core/models/ShortendLink';

@Injectable()
export class ShortenerService {
  constructor(
    private readonly typeorm: TypeormService,
  ) {}
  async fetchUrl(shortValue: string): Promise<ShortendLinkDTO> {
    let resp = await this.typeorm.getRepository(ShortendLink).findOne({ where: { shortCode: shortValue } });
    // return { resp.originalUrl};
    return {url: resp.originalUrl};
  }
}
