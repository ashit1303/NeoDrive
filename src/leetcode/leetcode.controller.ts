
import { Controller, Post, Body, Get, Query, HttpCode } from '@nestjs/common';
import { LeetCodeService } from './leetcode.service';
import { ApiBody, ApiOperation, ApiProperty, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
// import { UrlDTO,  } from './dto/leetcode.dto';
import { StandardErrorResponse } from 'src/core/http-exception.filter';
import { RedisService } from 'src/core/redis/redis.service';
import { CodeLangDTO, SolvedQuestsDTO } from './dto/leetcode.dto';
import { SonicService } from 'src/core/sonic/sonic.service';
import { ConfigService } from '@nestjs/config';
import { BaseResponse } from 'src/core/response.interceptor';

@ApiTags('LeetCode')
@Controller('leetcode')
export class LeetCodeController {
  constructor(
    private readonly leetCodeService: LeetCodeService,
    private readonly cache: RedisService,
    private readonly config:ConfigService,
    private readonly search: SonicService,
  ) { }

  // @Post('generate')
  // async generate(@Body() body: { prompt: string;}) {
  //     return await this.leetCodeService.generateResponse(
  //         body.prompt,
  //     );
  // }

  @Get('explain')
  @ApiOperation({ summary: 'Login' })
  @ApiQuery({ name: 'url', required: true, type: String, description: 'Leetcode URL', example: 'https://leetcode.com/problems/valid-parentheses/' })
  @ApiQuery({ name: 'codelang', required: true, enum: CodeLangDTO, enumName: 'CodeLangDTO', description: 'Code Language', example: 'js' })
  @ApiResponse({ status: 201, description: 'Success', type: String })
  @ApiResponse({ status: 400, description: 'Bad Request. Validation failed', type: StandardErrorResponse })
  @ApiProperty({ description: 'Explain code Leetcode URL' })
  async explainLeetQuest(@Query('url') url: string, @Query('codelang') codeLang: SolvedQuestsDTO['codeLang']) {
    // get the question details from db 
    // if not found use slug to get question details and store in db
    // explain from ollama
    const slug = this.leetCodeService.getSlugFromUrl(url);
    let cacheResp = await this.cache.get(codeLang + ':' + slug);
    if (cacheResp) return JSON.parse(cacheResp);
    let dbQuestion = await this.leetCodeService.getQuestFromDB(slug);
    // console.log(dbQuestion)
    if (!dbQuestion || !dbQuestion.questionId) {
      dbQuestion = await this.leetCodeService.fetchQuestionDetailsFromLeetCode(slug);
    }
    let solution = await this.leetCodeService.getQuestAnsFromDB(slug, codeLang);

    let explain = dbQuestion.llmRes;
    if (!solution || !solution.llmRes ) {  
      const question = `Problem Title: ${dbQuestion.questionTitle}\n Problem Statement:\n${dbQuestion.content}`;
      explain = await this.leetCodeService.getExplanation( codeLang, question, dbQuestion.questionId);
    }
    await this.cache.set(codeLang+ ':' + slug, JSON.stringify(explain));
    return explain;
  }

  @Get('search')
  @ApiQuery({ name: 'searchKey', required: true, type: String, description: 'Leetcode Problem', example: 'subarray' })
  @ApiResponse({ status: 201, description: 'Success', type: BaseResponse })
  @ApiResponse({ status: 400, description: 'Bad Request. Validation failed', type: StandardErrorResponse })
  @ApiProperty({ description: 'Search Leetcode Problems' })
  @ApiOperation({ summary: 'Search Leetcode Problems' })
  async searchLeetCodeQuests(@Query('searchKey') searchKey:string) {
    await this.search.ping();
    // const value = await this.search.suggest(this.config.get('DOMAIN'), 'leetcode', searchKey);
    const result = await this.search.search(this.config.get('DOMAIN'), 'leetcode', searchKey);

    const resStmts = await this.leetCodeService.getQuestByIds(result);
    return resStmts;
  }
}