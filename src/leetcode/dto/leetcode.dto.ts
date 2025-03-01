import { ApiProperty } from "@nestjs/swagger";
import { IsUrl } from "class-validator";
import { BaseResponse } from "src/core/response.interceptor";

export class UrlDTO {
  @ApiProperty({ description: 'Leetcode URL' })
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
  questionId: string;
  content: string;
  titleSlug: string;
  codeLang: 'js' | 'python' | 'java' | 'c++' | 'go' | null;
  llmRes: string;
  questionTitle: string;
  questionContent: string;
}

export class SearchQuestDTO {
  // questionId, itle_slug, code_lang, llm_res
  questionId: string;
  questionTitle: string;
}

export class TypesenseDocumentDTO {
  @ApiProperty({ description: 'Question ID' })
  id: string;
  @ApiProperty({ description: 'Question title' })
  questionTitle: string;
}

export class LeetSearchResponse extends BaseResponse<TypesenseDocumentDTO[]> {
  constructor(data: TypesenseDocumentDTO[]) {
    super();
    this.success = true;
    this.data = data;
  }
  @ApiProperty({ description: 'HTTP status code' })
  statusCode: number;
  @ApiProperty({ description: 'Request status' })
  success: boolean;
  @ApiProperty({ description: 'Response message' })
  message: string;
  @ApiProperty({ description: 'Payload', type: [TypesenseDocumentDTO],})
  data: TypesenseDocumentDTO[]
}