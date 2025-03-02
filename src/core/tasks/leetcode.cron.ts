import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeetCodeService } from '../../leetcode/leetcode.service';
import { ZincLogger } from '../logger/zinc.service';
import { Promise } from 'bluebird';
import { SonicService } from '../sonic/sonic.service';
import { ConfigService } from '@nestjs/config';
import { Quests } from '../models/Quests';
import { HelperAndFormatter as Helper } from '../helper';
import { TypeormService } from '../typeorm/typeorm.service';
import { IsNull, Not } from 'typeorm';
import { TypesenseService } from '../typesense/typesense.service';
import { Constants } from '../constants';
@Injectable()
export class LeetCodeCron {
  private collectionName = 'leetcode';
  constructor(
    private readonly leetService: LeetCodeService,
    private readonly logger: ZincLogger,
    private readonly search: SonicService,
    private readonly searchTypesense: TypesenseService,
    private readonly config: ConfigService,
    private readonly typeorm: TypeormService,

  ) { }

  @Cron(CronExpression.EVERY_MINUTE)
  async solveAndUpdateQuests() {
    try {
      const slugList = await this.leetService.getUnsolvedQuests();
      for (let i = 0; i < slugList.length; i++) {
        console.log(slugList[i])
      }
      await Promise.map(slugList, async (each) => this.leetService.sloveSlugInGivenLang(each.titleSlug, 'js'), { concurrency: 1 });
    } catch (error) {
      console.log(error)
      this.logger.error('Failed to update LeetCode problems:', error.message,);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateSonicIndexing() {
    try {
      await this.search.ping();
      await this.search.flushCollection(Constants.LeetCollection);
      const questions = await this.typeorm.getRepository(Quests).find({ select: ['id', 'questionTitle'], where: { questionId: Not(IsNull()) } });
      for (const quest of questions) {
        const name = Helper.sanitizeName(quest.questionTitle);
        const objectId = quest.id;
        console.log('name', name, 'objectId', objectId)
        await this.search.push(Constants.LeetCollection, objectId, name);
      }
    } catch (error) {
      console.log(error)
      this.logger.error('Failed to update LeetCode problems:', error.message,);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async rebuildIndex() {
    try {
      try {
      await this.searchTypesense.flushCollection(Constants.LeetCollection);
      } catch (error) {
        this.logger.error('collection not found',Constants.LeetCollection)
      }
      // Create new collection
      const schema = {
        name: Constants.LeetCollection,
        fields: [
          { name: 'id', type: 'string' },
          { name: 'questionTitle', type: 'string' },
        ],
        // default_sorting_field: 'id',
      };
      await this.searchTypesense.createCollection(schema);
      const questions = await this.typeorm.getRepository(Quests).find({ select: ['id', 'questionTitle'], where: { questionId: Not(IsNull()) } });
      for (const quest of questions) {
        const name = Helper.sanitizeName(quest.questionTitle);
        const objectId = quest.id;
        console.log('name', name, 'objectId', objectId)
        await this.search.push(Constants.LeetCollection, objectId, name);
      }
      // Index data
      for (const item of questions) {
        await this.searchTypesense.push(Constants.LeetCollection, item);
      }
    } catch (error) {
      console.error('Error rebuilding Typesense index:', error);
    }
  }

}
