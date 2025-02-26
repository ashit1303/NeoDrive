import { Global, Module } from '@nestjs/common';
import { OllamaService } from './ollama.service';
import { ConfigModule } from '@nestjs/config';
@Global()
@Module({
    imports: [ConfigModule],
    providers: [OllamaService],
    exports: [OllamaService]
})
export class OllamaModule {}