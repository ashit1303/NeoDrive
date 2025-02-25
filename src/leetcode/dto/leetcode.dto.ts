import { ApiProperty } from "@nestjs/swagger";
import { IsUrl } from "class-validator";

export class UrlDTO {
  @ApiProperty({description:'Leetcode URL'})
  @IsUrl()
  url: string;
}

export enum CodeLangDTO {
  PYTHON = 'python',
  JS = 'js',
  GO = 'go',
  JAVA = 'java',
  CPP = 'cpp'
}