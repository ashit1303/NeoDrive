import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OllamaService {
    private readonly baseUrl: string;
    private readonly model: string;

    constructor(private configService: ConfigService) {
        this.baseUrl = this.configService.get<string>('OLLAMA_URL') || 'http://localhost:11434';
    }

    async generateResponse(prompt: string, ) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/generate`, {
                model: this.model,
                prompt,
                stream: false
            });
            return response.data.response;
        } catch (error) {
            throw new Error(`Ollama API error: ${error.message}`);
        }
    }

    async listModels() {
        try {
            const response = await axios.get(`${this.baseUrl}/api/tags`);
            return response.data.models;
        } catch (error) {
            throw new Error(`Failed to fetch models: ${error.message}`);
        }
    }

    async chat(messages: Array<{ role: string; content: string }>) {
        try {
            const response = await axios.post(`${this.baseUrl}/api/chat`, {
                model: this.model,
                messages,
                stream: false
            });
            return response.data;
        } catch (error) {
            throw new Error(`Chat API error: ${error.message}`);
        }
    }
}