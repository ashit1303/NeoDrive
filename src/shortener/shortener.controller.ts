import { Controller, Get, HttpCode, HttpStatus, Param, Post, Query, UsePipes } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JoiValidate } from 'src/core/joi/joi.service';
import { shortCode } from './shortener.dto';
import joiToSwagger from 'joi-to-swagger';
import { TypeormService } from 'src/core/typeorm/typeorm.service';
import { ShortendLink } from 'src/core/models/ShortendLink';


const { swagger: shortCodeSwagger } = joiToSwagger(shortCode);

@ApiTags('Shortener')
@Controller('s')
export class ShortenerController {
  constructor(private typeorm: TypeormService) {}
  // to create link shortener urls
  // to redirect to original url
  @Get(':shortValue')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ schema: shortCodeSwagger, name: 'shortValue' })
  @ApiOperation({ summary: 'Redirect to original URL', description: 'Redirect to original URL.' })
  @ApiResponse({ status: 200, description: 'Redirecting to original URL' })
  @UsePipes(new JoiValidate(shortCode))
  async redirectToUrl(@Param('shortValue') shortValue: string) {
    this.typeorm.getRepository(ShortendLink).findOne({ where: { shortCode: shortValue } });
      return 'Redirecting to original URL';
  }




  @Post('is-available')
  async isAvailable() {
      return 'Redirecting to original URL';
  }



  @Post()
  async createShortUrl() {
      return 'Shortened URL';
  }
    
}
