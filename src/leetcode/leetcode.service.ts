import { Injectable } from "@nestjs/common";
import { Quests } from "src/core/models/Quests";
import { TypeormService } from "src/core/typeorm/typeorm.service";
import { HelperAndFormatter as Helper } from "src/core/helper";
import axios from 'axios';
import { ConfigService } from "@nestjs/config";
import { OllamaService } from "src/core/ollama/ollama.service";
import { ZincLogger } from "src/core/logger/zinc.service";
import { QuestsAnswer } from "src/core/models/QuestsAnswer";


@Injectable()
  export class LeetCodeService{
    constructor (
      private typeorm: TypeormService,
      private readonly configService: ConfigService,
      private readonly ollama: OllamaService,
      private readonly logger: ZincLogger,
    ){}
    getSlugFromUrl(url: string): string {
      return url.split('problems/')[1].split('/')[0];
    }

    async handleExtraSlugs(slugsList: string[]): Promise<void> {
      if (!slugsList || slugsList.length === 0) {
        this.logger.log('No slugs to insert', slugsList);
        return; // Handle empty input gracefully
      }
  
      let relatedQuests = [];
      slugsList.forEach((element: any) => {
        relatedQuests.push(element.titleSlug);
      });
  
      try {
        const valuesToInsert = relatedQuests.map((slug) => ({ titleSlug: slug })); // Prepare data for insert
  
        await this.typeorm.getRepository(Quests)
          .createQueryBuilder()
          .insert()
          .into(Quests)
          .values(valuesToInsert) // Insert multiple values at once
          .orIgnore()
          .execute();
  
      } catch (error) {
        this.logger.error('No slugs to insert', error, slugsList);
        
        Promise.resolve()
      }
    }

    async storeQuestsAnswer(data: any,slug: string, codelang) {
      try{
      const dbQuestion = await this.getQuestFromDB(slug);
      const questAnswer = this.typeorm.getRepository(QuestsAnswer).create({
        questionId: dbQuestion.questionId|| null,
        codeLang: codelang.toLowerCase()|| null, // Ensure ENUM values are lowercase
        llmRes: data || null,
      });
      return this.typeorm.getRepository(QuestsAnswer).save(questAnswer);
      }catch (error) {
        this.logger.error('Error While Storing LeetQuests', error, data);
        Promise.resolve()
      }
    }

    async storeQuestion(data: any) {
      this.handleExtraSlugs([...data.similarQuestionList,...data.nextChallenges]);

      const cleanedContent= Helper.cleanHTML(data.content);
      const newQuestion = this.typeorm.getRepository(Quests).create({
        questionId: data.questionId|| null,
        titleSlug: data.titleSlug,
        difficulty: data.difficulty.toLowerCase()|| null, // Ensure ENUM values are lowercase
        questionTitle: data.questionTitle|| null,
        content: data.content|| null,
        cleanedContent: cleanedContent|| null,
        categoryTitle: data.categoryTitle|| null,
      });
      return this.typeorm.getRepository(Quests).save(newQuestion);
    }


    async getQuestFromDB(slug:string): Promise<any> {
      // return this.typeorm.getRepository(Quests).findOne({ where: { titleSlug: url } });
      return await this.typeorm.getRepository(Quests).findOne({ where: { titleSlug: slug } });
      
    }
    // https://leetcode.com/problems/longest-substring-without-repeating-characters/

    async fetchQuestionDetailsFromLeetCode(slug:string) {
        const url = "https://leetcode.com/graphql";
        const query = {
            query: ` query getQuestionDetail($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                    titleSlug
                    questionId
                    questionFrontendId
                    questionTitle
                    content
                    categoryTitle
                    difficulty
                    similarQuestionList {
                      difficulty
                      titleSlug
                      questionId
                      title
                    }
                    nextChallenges {
                      difficulty
                      questionId
                      title
                      titleSlug
                    }
                }
            }`,
            variables: { titleSlug: slug },
            // operationName: 'questionDetail'
        };
        try {
            const response = await axios.post(url, query, {
                headers: {
                  'accept': '*/*',
                  'accept-language': 'en-US,en;q=0.9',
                  'content-type': 'application/json',
                  'cookie': this.configService.get('LEET_COOKIE'),
                  'origin': 'https://leetcode.com',
                  'priority': 'u=1, i',
                  'random-uuid': '00b3b94a-d622-baec-d6fa-77dbd29d94d3',
                  'referer': 'https://leetcode.com/problems/${slug}/description/',
                  'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
                  'sec-ch-ua-mobile': '?0',
                  'sec-ch-ua-platform': '"Linux"',
                  'sec-fetch-dest': 'empty',
                  'sec-fetch-mode': 'cors',
                  'sec-fetch-site': 'same-origin',
                  'sentry-trace': 'aadd23de586549d0b62e02c85c318cd5-b5d86e9245155ec0-0',
                  'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
                  'x-csrftoken': 'Yuj3H94eV7MNl7hAI1OeXAisL1CSkyvmuNauiTyJwJXQNGcvistoup1NwaNZxGZv'
                }
            });
    
            const problemDetails = response.data.data.question;
            await this.storeQuestion(problemDetails)
            return problemDetails;
        } catch (error) {
            this.logger.error("Error fetching problem:", error.message);
        }
    }

    async getExplanation(codeLang: string, questionDescription: string, slug: string) {
      let explainPromt = `Give only optimed code, explanation, time and space complexity in ${codeLang}`
      const llmRes = await  this.ollama.generateResponse(questionDescription+' '+explainPromt);
      this.storeQuestsAnswer(llmRes,slug,codeLang);
      return llmRes;
    }

}


