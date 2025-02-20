import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, Res, UsePipes } from '@nestjs/common';
import { Response } from 'express';
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JoiValidate } from 'src/core/joi/joi.service';
import { shortCode, ShortendLinkDTO } from './shortener.dto';
import joiToSwagger from 'joi-to-swagger';
import { TypeormService } from 'src/core/typeorm/typeorm.service';
import { ShortendLink } from 'src/core/models/ShortendLink';
import { ShortenerService } from './shortener.service';
import { BaseResponse } from 'src/core/response.interceptor';
import { StandardErrorResponse } from 'src/core/http-exception.filter';

const { swagger: shortCodeSwagger } = joiToSwagger(shortCode);

@ApiTags('Shortener')
@Controller('s')
export class ShortenerController {
  constructor(private typeorm: TypeormService,
    private readonly shortenerService: ShortenerService,
  ) {}
  // to create link shortener urls
  // to redirect to original url
  @Get(':shortValue')
  @HttpCode(HttpStatus.OK)
  @ApiParam({ schema: shortCodeSwagger, name: 'shortValue' })
  @ApiOperation({ summary: 'Redirect to original URL', description: 'Redirect to original URL.' })
  @ApiResponse({ status: 200, description: 'Redirecting to original URL', type: BaseResponse<ShortendLinkDTO>}, )
  @UsePipes(new JoiValidate(shortCode))
  async redirectToUrl(@Param('shortValue') shortValue: string) {
    this.typeorm.getRepository(ShortendLink).findOne({ where: { shortCode: shortValue } });
      return 'Redirecting to original URL';
  }

  // @Get('default')
  // async getDefaultRights(@Req() req: Request, @Res() res: Response) {
  //   return res.json();
  // }

  @Post('is-available')
  @HttpCode(HttpStatus.OK)
  @ApiBody({ schema: shortCodeSwagger })
  @ApiOperation({ summary: 'Check if short URL is available', description: 'Check if short URL is available.' })
  @ApiResponse({ status: 200, description: 'Short URL is available', type: BaseResponse<ShortendLinkDTO> })
  @ApiResponse({ status: 400, description: 'Error', type: StandardErrorResponse})

  async isAvailable(@Body('shortCode')  { shortCode: shortCode}, ) {
      const data = await this.shortenerService.fetchUrl(shortCode);
      return data
  }



  @Post()
  async createShortUrl() {
      return 'Shortened URL';
  }
    
}
