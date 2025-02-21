import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/core/response.interceptor';
import { IsString, IsUrl } from 'class-validator';
export class ShortendLinkDTO {
    @ApiProperty({ description: 'Complete URL' })
    url: string;
}
export class ShortifyDTO {
    @ApiProperty({ description: 'Short value' })
    shortCode: string;
    @IsUrl()
    @ApiProperty({ description: 'Complete URL' })
    originalUrl: string;
}

export class ShortenLinkSuccessResponse extends BaseResponse<ShortendLinkDTO> {
  constructor(data: ShortendLinkDTO) {
    super();
    this.success = true;
    this.data = data;
  }
}