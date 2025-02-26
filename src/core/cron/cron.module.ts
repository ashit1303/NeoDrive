
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { LeetCodeCron } from '../jobs/leetcode.cron';
import { LeetCodeService } from 'src/leetcode/leetcode.service';
import { OllamaService } from '../ollama/ollama.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [LeetCodeCron, LeetCodeService, OllamaService],
})
export class CronModule {}