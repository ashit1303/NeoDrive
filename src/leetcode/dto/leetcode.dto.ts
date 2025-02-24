import { ApiProperty } from "@nestjs/swagger";
import { IsUrl } from "class-validator";

export class UrlDTO {
  @ApiProperty({description:'Leetcode URL'})
  @IsUrl()
  url: string;
}