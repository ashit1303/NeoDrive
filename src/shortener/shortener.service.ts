import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TypeormService } from 'src/core/typeorm/typeorm.service';
// import { ShortendLinkDTO } from './shortener.dto';
import { ShortendLink } from 'src/core/models/ShortendLink';
import { ZincLogger } from 'src/core/logger/zinc.service';

@Injectable()
export class ShortenerService {
  constructor(
    private readonly typeorm: TypeormService,
    private readonly logger: ZincLogger,
  ) { }
  async fetchUrl(shortValue: string): Promise<string> {
    let resp = await this.typeorm.getRepository(ShortendLink).findOne({ where: { shortCode: shortValue } });
    // return { resp.originalUrl};
    return resp.originalUrl;
  }
  async checkIfAvailable(shortValue: string): Promise<boolean> {
    try {
      let resp = await this.typeorm.getRepository(ShortendLink).findOne({ where: { shortCode: shortValue } });
      // return { resp.originalUrl};
      return !Boolean(resp);
    } catch (error) {
      this.logger.error('FailedToCheckIfAvailable', 'checkIfAvailable', { error });
      throw new NotFoundException(error.message || 'Short code already exists');
    }
  }
  async createShortUrl(shortValue: string, originalUrl: string): Promise<boolean> {
    try {
      await this.typeorm.getRepository(ShortendLink).save({ originalUrl: originalUrl, shortCode: shortValue });
      return true;
    } catch (error) {
      this.logger.error('FailedToShortify', 'createShortUrl', { error });
      // console.log("error", error)
      throw new BadRequestException(error.message || 'Token generation failed');
    }

  }
}
