// import { Controller, Post, Body, Get } from '@nestjs/common';
// import { OllamaService } from './ollama.service';

// @Controller('ai')
// export class OllamaController {
//     constructor(private readonly ollamaService: OllamaService) {}

//     @Post('generate')
//     async generate(@Body() body: { prompt: string;}) {
//         return await this.ollamaService.generateResponse(
//             body.prompt,
//         );
//     }

//     @Post('chat')
//     async chat(@Body() body: { 
//         messages: Array<{ role: string; content: string }>;
//     }) {
//         return await this.ollamaService.chat(
//             body.messages,
//         );
//     }

//     @Get('models')
//     async listModels() {
//         return await this.ollamaService.listModels();
//     }
// }