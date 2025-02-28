import { Injectable, Logger } from '@nestjs/common';
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


@Injectable()
export class LeetCodeCron {
  constructor(
    private readonly leetService: LeetCodeService,
    private readonly logger: ZincLogger,
    private readonly search: SonicService,
    private readonly config: ConfigService,
    private readonly typeorm: TypeormService,

  ) { }

  @Cron(CronExpression.EVERY_HOUR)
  async solveAndUpdateQuests() {
    try {
      const slugList = await this.leetService.getUnsolvedQuests();
      for (let i = 0; i < slugList.length; i++) {
        console.log(slugList[i])
      }
      await Promise.map(slugList, async (each) =>  this.leetService.sloveSlugInGivenLang(each.titleSlug, 'js'), { concurrency: 1 });
    } catch (error) {
      console.log(error)
      this.logger.error('Failed to update LeetCode problems:', error.message,);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async updateSonicIndexing() {
    try {
      await this.search.ping();
      await this.search.flushCollection('leetcode');
      const questions = await this.typeorm.getRepository(Quests).find( {select: ['id', 'questionTitle'] ,where: { questionId: Not (IsNull()) } } );
      for (const quest of questions) {
          const name = Helper.sanitizeName(quest.questionTitle);
          const objectId = quest.id;
          console.log('name', name, 'objectId', objectId)
          await this.search.push(this.config.get('DOMAIN'), 'leetcode', objectId, name );
      }
    } catch (error) {
      console.log(error)
      this.logger.error('Failed to update LeetCode problems:', error.message,);
    }
  }

}
