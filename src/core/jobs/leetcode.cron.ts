import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LeetCodeService } from '../../leetcode/leetcode.service';
import { ZincLogger } from '../logger/zinc.service';
import { Promise } from 'bluebird';


@Injectable()
export class LeetCodeCron {
  constructor(
    private readonly leetService: LeetCodeService,
    private readonly logger: ZincLogger,

  ) { }

  @Cron(CronExpression.EVERY_MINUTE)
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
}