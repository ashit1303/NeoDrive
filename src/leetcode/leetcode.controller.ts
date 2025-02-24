
import { Controller, Post, Body, Get, Query, HttpCode } from '@nestjs/common';
import { LeetCodeService } from './leetcode.service';
import { ApiBody, ApiOperation, ApiProperty, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UrlDTO,  } from './dto/leetcode.dto';
import { StandardErrorResponse } from 'src/core/http-exception.filter';

@ApiTags('LeetCode')
@Controller('leetcode')
export class LeetCodeController {
    constructor(private readonly leetCodeService: LeetCodeService) {}

    // @Post('generate')
    // async generate(@Body() body: { prompt: string;}) {
    //     return await this.leetCodeService.generateResponse(
    //         body.prompt,
    //     );
    // }

    @Get('explain')
    @ApiOperation({ summary: 'Login' })
    @ApiQuery({ name: 'url', required: true, type: String, description: 'Leetcode URL', example: 'https://leetcode.com/problems/valid-parentheses/' })
    @ApiQuery({ name: 'codelang', required: true, type: String, description: 'Code Language', example: 'python' })
    @ApiResponse({ status: 201, description: 'Success', type: String })
    @ApiResponse({ status: 400, description: 'Bad Request. Validation failed',type: StandardErrorResponse })
    @ApiProperty({ description: 'Explain code Leetcode URL' })
    async explainLeetQuest(@Query('url') url: string, @Query('codelang') codeLang: string) {
      // get the question details from db 
      // if not found use slug to get question details and store in db
      // explain from ollama
      let dbQuestion = await this.leetCodeService.getQuestFromDB(url);
      if(!dbQuestion){
        const slug = this.leetCodeService.getSlugFromUrl(url);
        dbQuestion = await this.leetCodeService.fetchQuestionDetailsUsingSlug(slug);
      }
      dbQuestion = JSON.stringify(dbQuestion);
      const explain = await this.leetCodeService.getExplanation(codeLang, dbQuestion);
      return explain;


    }

    // @Get('search')
}