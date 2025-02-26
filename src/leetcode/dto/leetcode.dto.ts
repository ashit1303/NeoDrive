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


export class SolvedQuestsDTO {
  
  // questionId, itle_slug, code_lang, llm_res
  questionId:string;
  content:string;
  titleSlug: string;
  codeLang: 'js' | 'python' | 'java' | 'c++' | 'go';
  llmRes: string;
  questionTitle: string;
  questionContent: string;
}