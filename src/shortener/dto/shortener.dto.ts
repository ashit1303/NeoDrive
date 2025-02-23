import { ApiProperty } from '@nestjs/swagger';
import { BaseResponse } from 'src/core/response.interceptor';
import { IsString, IsUrl, Matches } from 'class-validator';
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

export class ShortCodeDTO {
  @ApiProperty({ description: 'Short value' })
  // @Matches({ message: 'shortCode must be in the format xxx-xxx-xxx' }, /^[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}-[a-zA-Z0-9]{3}$/)
  shortCode: string;
}

export class ShortenLinkSuccessResponse extends BaseResponse<ShortendLinkDTO> {
  constructor(data: ShortendLinkDTO) {
    super();
    this.success = true;
    this.data = data;
  }
}