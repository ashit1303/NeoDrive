import { Body, Controller, Get, Head, HttpCode, HttpStatus, Param, Post, Query, Res, UsePipes } from '@nestjs/common';
import { Response } from 'express';
import {  ApiBody, ApiNotFoundResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JoiValidate } from 'src/core/joi/joi.service';
import { ShortendLinkDTO, ShortenLinkSuccessResponse, ShortifyDTO } from './shortener.dto';
// import joiToSwagger from 'joi-to-swagger';
import { TypeormService } from 'src/core/typeorm/typeorm.service';
import { ShortenerService } from './shortener.service';
import { BaseResponse } from 'src/core/response.interceptor';
import { StandardErrorResponse } from 'src/core/http-exception.filter';
import { HelperAndFormatter as Helper } from 'src/core/helper';

// const { swagger: shortCodeSwagger } = joiToSwagger(shortCodeJoi);

@ApiTags('Shortener')
@Controller('shortify')
export class ShortenerController {
  constructor(private typeorm: TypeormService,
    private readonly shortenerService: ShortenerService,
  ) {}

  @Get(':shortValue')
  @HttpCode(HttpStatus.OK)
  // @ApiParam({ schema : shortCodeSwagger, name: 'shortValue' })
  @ApiParam({ name: 'shortValue', example: 'aaa-aaa-aaa' })
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiResponse({ status: 200, description: 'Redirecting to original URL', type: BaseResponse<ShortendLinkDTO>}, )
  async redirectToUrl(@Param('shortValue') shortValue: string, @Res() res: Response) {

      return res.redirect(await this.shortenerService.fetchUrl(shortValue));
  }

  // @Get('default')
  // async getDefaultRights(@Req() req: Request, @Res() res: Response) {
  //   return res.json();
  // }

  @Head('is-available')
  @HttpCode(HttpStatus.OK)
  // @ApiBody({ schema: shortCodeSwagger })
  @ApiQuery({ name: 'shortCode', example: 'aaa-aaa-aaa' })

  @ApiOperation({ summary: 'Check if short URL is available'})
  @ApiResponse({ status: 200, description: 'Short URL is available', type: ShortenLinkSuccessResponse })
  @ApiResponse({ status: 400, description: 'Error', type: StandardErrorResponse})
  async isAvailable(@Query('shortCode')  { shortCode: shortCode}, ) {
      const data = await this.shortenerService.checkIfAvailable(shortCode);
      return {isAvailable: data}
  }

  @Post('short-it')
  @ApiQuery({ name: 'shortCode', example: 'aaa-aaa-aaa' })
  @ApiQuery({ name: 'originalUrl', example: 'https://www.google.com' })
  @ApiOperation({ summary: 'Shorten URL'})
  @ApiResponse({ status: 200})
  @ApiResponse({ status: 400, description: 'Error', type: StandardErrorResponse})
  @ApiNotFoundResponse({ description: 'Not Found', type: StandardErrorResponse})
  async createShortUrl(@Query('shortCode') shortCode: string, @Query('originalUrl') originalUrl: string) {
    const data = await this.shortenerService.createShortUrl(shortCode, originalUrl);

    return {added: data}
  }

  @Post('short-it-by-guest')
  @ApiQuery({ name: 'originalUrl', example: 'https://www.google.com' })
  @ApiOperation({ summary: 'Shorten URL by guest without short code'})
  @ApiResponse({ status: 200})
  @ApiResponse({ status: 400, description: 'Error', type: StandardErrorResponse})
  @ApiNotFoundResponse({ description: 'Not Found', type: StandardErrorResponse})
  async createShortUrlByGuest( @Query('originalUrl') originalUrl: string) {
    const shortCode = Helper.generateShortCode();
    const data = await this.shortenerService.createShortUrl(shortCode, originalUrl);
    
    return {added: data, shortCode: shortCode};
  }
}
