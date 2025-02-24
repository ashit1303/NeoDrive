import { Module } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [ConfigModule],
    providers: [OllamaService],
    exports: [OllamaService]
})
export class OllamaModule {}