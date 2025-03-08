import { Injectable } from "@nestjs/common";
import { Quests } from "src/core/models/Quests";
import { TypeormService } from "src/core/typeorm/typeorm.service";
import { HelperAndFormatter as Helper } from "src/core/helper";
import axios from 'axios';
import { ConfigService } from "@nestjs/config";
import { OllamaService } from "src/core/ollama/ollama.service";
import { ZincLogger } from "src/core/logger/zinc.service";
import { QuestsAnswer } from "src/core/models/QuestsAnswer";
import { In, IsNull, Not } from "typeorm";
import { SearchQuestDTO, SolvedQuestsDTO } from "./dto/leetcode.dto";
import { SonicService } from "src/core/sonic/sonic.service";


@Injectable()
export class LeetCodeService {
  constructor(
    private readonly typeorm: TypeormService,
    private readonly configService: ConfigService,
    private readonly ollama: OllamaService,
    private readonly smoothSearch: SonicService,
    private readonly logger: ZincLogger,
  ) { }
  getSlugFromUrl(url: string): string {
    return url.split('problems/')[1].split('/')[0];
  }

  async handleExtraSlugs(slugsList: string[]): Promise<void> {
    if (!slugsList || slugsList.length === 0) {
      this.logger.log('No slugs to insert', slugsList);
      return; // Handle empty input gracefully
    }
    try {
      let relatedQuests = [];
      slugsList.forEach((element: any) => {
        relatedQuests.push(element.titleSlug);
      });
      for await(const slug of relatedQuests) {
        await this.typeorm.getRepository(Quests).query(`INSERT IGNORE INTO quests (title_slug) VALUES ('${slug}');`);
      }
      // const valuesToInsert = relatedQuests.map((slug) => ({ titleSlug: slug })); // Prepare data for insert

      // await this.typeorm.getRepository(Quests)
      //   .createQueryBuilder()
      //   .insert()
      //   .into(Quests)
      //   .values(valuesToInsert) // Insert multiple values at once
      //   .orIgnore()
      //   .execute();

    } catch (error) {
      this.logger.error('No slugs to insert', error.message, slugsList);
      Promise.resolve()
    }
  }

  async storeQuestsAnswer(data: any, codelang, questionId) {
    try {
      // const dbQuestion = await this.getQuestFromDB(slug);
      const questAnswer = this.typeorm.getRepository(QuestsAnswer).create({
        questionId: questionId || null,
        codeLang: codelang.toLowerCase() || null, // Ensure ENUM values are lowercase
        llmRes: data || null,
      });
      return this.typeorm.getRepository(QuestsAnswer).save(questAnswer);
    } catch (error) {
      this.logger.error('Error While Storing LeetQuests', error.message, data);
      Promise.resolve()
    }
  }

  async storeQuestion(data: any) {
    this.handleExtraSlugs([...data.similarQuestionList, ...data.nextChallenges]);

    const cleanedContent = Helper.cleanHTML(data.content);
    await this.typeorm.getRepository(Quests)
      .createQueryBuilder()
      .insert()
      .into(Quests)
      .values({
        questionId: data.questionId || null,
        titleSlug: data.titleSlug,
        difficulty: data.difficulty.toLowerCase() || null,
        questionTitle: data.questionTitle || null,
        content: data.content || null,
        cleanedContent: cleanedContent || null,
        categoryTitle: data.categoryTitle || null,
      })
      .orUpdate(
        ["question_id", "difficulty", "question_title", "content", "cleaned_content", "category_title"],
        ["titleSlug"]
      )
      // .setParameter('questionId', data.questionId || null)
      // .setParameter('difficulty', data.difficulty.toLowerCase() || null)
      // .setParameter('questionTitle', data.questionTitle || null)
      // .setParameter('content', data.content || null)
      // .setParameter('cleanedContent', cleanedContent || null)
      // .setParameter('categoryTitle', data.categoryTitle || null)
      // .returning('*')
      .execute();

  }


  async getQuestFromDB(slug: string): Promise<any> {
    // return this.typeorm.getRepository(Quests).findOne({ where: { titleSlug: url } });
    // return await this.typeorm.getRepository(Quests).findOne({ where: { titleSlug: slug, questionId: null } });
    return await this.typeorm.getRepository(Quests).findOne({ where: { titleSlug: slug } });

  }
  async getQuestAnsFromDB(slug: string, codeLang: SolvedQuestsDTO['codeLang']): Promise<SolvedQuestsDTO> {
    const [quesiton] = await this.typeorm.query(`SELECT qu.question_id as questionId, qu.title_slug as titleSlug,qu.content, code_lang as codeLang, llm_res as llmRes, qu.difficulty, qu.question_id, qu.content, qu.question_title as questionTitle FROM quests_answer qa right join quests qu on qa.question_id = qu.question_id WHERE qu.title_slug = '${slug}' and qa.code_lang = '${codeLang}'  LIMIT 1`);
    return quesiton
  }
  // https://leetcode.com/problems/longest-substring-without-repeating-characters/

  async fetchQuestionDetailsFromLeetCode(slug: string) {
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
      console.log('problemDetails', JSON.stringify(problemDetails))
      await this.storeQuestion(problemDetails)
      return problemDetails;
    } catch (error) {
      this.logger.error("Error fetching problem:", error.message);
    }
  }

  async getExplanation(codeLang: string, questionDescription: string, questionId: string) {
    let explainPromt = `Give only optimed code, explanation, time and space complexity in ${codeLang}`
    const llmRes = await this.ollama.generateResponse(explainPromt + ' ' + questionDescription);
    this.storeQuestsAnswer(llmRes, codeLang, questionId);
    return llmRes;
  }

  async sloveSlugInGivenLang(slug: string, codeLang: SolvedQuestsDTO["codeLang"]) {
    try {
      let dbQuestion = await this.fetchQuestionDetailsFromLeetCode(slug);
      let questionId = dbQuestion.questionId

      dbQuestion = `Problem Title: ${dbQuestion.questionTitle}\n Problem Statement:\n${dbQuestion.cleanedContent || dbQuestion.content}`;
      dbQuestion = JSON.stringify(dbQuestion);
      const explain = await this.getExplanation(codeLang, dbQuestion, questionId);
      return;
    } catch (error) {
      this.logger.error('Error While Solving LeetQuests', error.message);
      Promise.resolve();
    }
  }

  async getUnsolvedQuests() {
    return this.typeorm.getRepository(Quests).find({ where: { questionId: IsNull() }, take: 1 });
  }

  async getQuestByIds(ids: string[]): Promise<Quests[]> {
    return this.typeorm.getRepository(Quests).find({ select: ['id', 'questionTitle'], where: { id: In(ids) } });
  }


  async fetchQuestionLists(skip: string) {
    const url = "https://leetcode.com/graphql";
    const query = {
      "query":" query problemsetPanelQuestionList($filters: QuestionFilterInput, $searchKeyword: String, $sortBy: QuestionSortByInput, $categorySlug: String, $limit: Int, $skip: Int) { problemsetPanelQuestionList( filters: $filters searchKeyword: $searchKeyword sortBy: $sortBy categorySlug: $categorySlug limit: $limit skip: $skip ) { questions { id titleSlug title translatedTitle questionFrontendId paidOnly difficulty topicTags { name slug nameTranslated } status isInMyFavorites frequency acRate } totalLength finishedLength panelName hasMore }} ","variables":{"skip":skip,"limit":100,"categorySlug":"","filters":{"filterCombineType":"ALL","statusFilter":{"questionStatuses":[],"operator":"IS"},"difficultyFilter":{"difficulties":[],"operator":"IS"},"languageFilter":{"languageSlugs":[],"operator":"IS"},"topicFilter":{"topicSlugs":[],"operator":"IS"},"acceptanceFilter":{},"frequencyFilter":{},"lastSubmittedFilter":{},"publishedFilter":{},"companyFilter":{"companySlugs":[],"operator":"IS"},"positionFilter":{"positionSlugs":[],"operator":"IS"},"premiumFilter":{"premiumStatus":[],"operator":"IS"}},"searchKeyword":"","sortBy":{"sortField":"CUSTOM","sortOrder":"ASCENDING"},"options":{"enabled":true},"filtersV2":{"filterCombineType":"ALL","statusFilter":{"questionStatuses":[],"operator":"IS"},"difficultyFilter":{"difficulties":[],"operator":"IS"},"languageFilter":{"languageSlugs":[],"operator":"IS"},"topicFilter":{"topicSlugs":[],"operator":"IS"},"acceptanceFilter":{},"frequencyFilter":{},"lastSubmittedFilter":{},"publishedFilter":{},"companyFilter":{"companySlugs":[],"operator":"IS"},"positionFilter":{"positionSlugs":[],"operator":"IS"},"premiumFilter":{"premiumStatus":[],"operator":"IS"}}},"operationName":"problemsetPanelQuestionList"
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
      console.log('problemDetails', JSON.stringify(problemDetails))
      await this.storeQuestion(problemDetails)
      return problemDetails;
    } catch (error) {
      this.logger.error("Error fetching problem:", error.message);
    }
  }
  // async updateSonicSearchForQuestions(){
  //   const questions = await this.typeorm.getRepository(Quests).find( {select: ['id', 'questionTitle']} );
  //   for (const question of questions) {
  //     this.smoothSearch.push(this.configService.get('DOMAIN'),'leetcode',JSON.stringify(question), question.questionTitle);
  //   }
  // }

  // async indexEntityColumn(entityId: number, columnName: string, columnValue: string): Promise<string> {
  //   const bucket = 'your_bucket'; // Define your Sonic bucket
  //   const collection = 'your_collection'; // Define your Sonic collection
  //   try {
  //     // Sanitize the text. Sonic best practices.
  //     const sanitizedText = columnValue.replace(/[^a-zA-Z0-9\s]/g, '');

  //     // Ingest the data into Sonic.
  //     await this.sonicChannel.ingest(bucket, collection, entityId.toString(), columnName, {
  //       lang: 'en', // Specify language if needed
  //     });

  //     return entityId.toString(); // Return the entity ID (used as object ID in sonic)
  //   } catch (error) {
  //     console.error('Error indexing entity column in Sonic:', error);
  //     throw error; // Rethrow the error for handling elsewhere
  //   }
  // }

}
