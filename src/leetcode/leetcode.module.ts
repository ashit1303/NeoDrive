
import { Module } from '@nestjs/common';
import { LeetCodeService } from './leetcode.service';
import { ConfigModule } from '@nestjs/config';
import { OllamaService } from 'src/core/ollama/ollama.service';
import { LeetCodeController } from './leetcode.controller';

@Module({
    imports: [ConfigModule],
    controllers: [LeetCodeController],
    providers: [LeetCodeService,OllamaService],
    exports: [LeetCodeService]
})
export class LeetCodeModule {}