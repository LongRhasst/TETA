import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

@Injectable()
export class LMStudioService {
  private readonly logger = new Logger(LMStudioService.name);
  private readonly client: AxiosInstance;
  private readonly baseURL: string;
  private readonly model: string;
  private readonly timeout: number;

  constructor(private readonly configService: ConfigService) {
    this.baseURL = this.configService.get<string>('LM_STUDIO_API_URL') || 'http://127.0.0.1:1234';
    this.model = this.configService.get<string>('LM_STUDIO_MODEL') || 'deepseek/deepseek-r1-0528-qwen3-8b';
    this.timeout = this.configService.get<number>('AI_TIMEOUT') || 120000;

    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.logger.log(`LM Studio client initialized (URL=${this.baseURL}, model=${this.model})`);
  }

  /**
   * Generate content using LM Studio API (OpenAI compatible)
   */
  async generateContent(prompt: string, systemPrompt?: string): Promise<string> {
    try {
      // Truncate inputs to fit context window
      const maxSystemPromptLength = 500;
      const maxUserPromptLength = 3000; // Leave room for response tokens
      
      const truncatedSystemPrompt = systemPrompt ? 
        (systemPrompt.length > maxSystemPromptLength ? 
          systemPrompt.substring(0, maxSystemPromptLength) + '...' : 
          systemPrompt) : undefined;
      
      const truncatedUserPrompt = prompt.length > maxUserPromptLength ? 
        prompt.substring(0, maxUserPromptLength) + '\n\n[Dữ liệu đã được rút gọn do giới hạn context]' : 
        prompt;

      const messages: ChatMessage[] = [];
      
      if (truncatedSystemPrompt) {
        messages.push({ role: 'system', content: truncatedSystemPrompt });
      }
      
      messages.push({ role: 'user', content: truncatedUserPrompt });

      const requestBody: ChatCompletionRequest = {
        model: this.model,
        messages: messages,
        temperature: 0.3,
        max_tokens: 2000, // Reduced to ensure context fit
        stream: false,
      };

      this.logger.debug(`Sending request to LM Studio with ${messages.length} messages, total chars: ${JSON.stringify(requestBody).length}`);

      const response = await this.client.post<ChatCompletionResponse>('/v1/chat/completions', requestBody);

      if (!response.data?.choices || response.data.choices.length === 0) {
        throw new Error('No choices returned from LM Studio');
      }

      const choice = response.data.choices[0];
      if (!choice.message?.content) {
        throw new Error('No content in LM Studio response');
      }

      this.logger.debug(`LM Studio response: ${choice.message.content.substring(0, 200)}...`);
      
      return choice.message.content;
    } catch (error: any) {
      this.logger.error('LM Studio API error:', error?.response?.data || error?.message || error);
      
      if (error?.code === 'ECONNREFUSED') {
        throw new Error('LM Studio server is not running. Please start LM Studio and ensure the server is listening on ' + this.baseURL);
      }
      
      if (error?.response?.status === 404) {
        throw new Error(`Model '${this.model}' not found in LM Studio. Please load the model first.`);
      }
      
      if (error?.response?.status === 400 && error?.response?.data?.error?.includes('context')) {
        throw new Error(`Context length exceeded. Try reducing input data or use a model with larger context window.`);
      }
      
      throw new Error(`LM Studio API failed: ${error?.response?.data?.error?.message || error?.response?.data?.error || error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Generate content with chunking for large inputs
   */
  async generateContentWithChunking(prompt: string, systemPrompt?: string): Promise<string> {
    const maxChunkSize = 2500; // Conservative chunk size
    
    if (prompt.length <= maxChunkSize) {
      return this.generateContent(prompt, systemPrompt);
    }

    // Split large prompt into chunks
    const chunks = this.splitIntoChunks(prompt, maxChunkSize);
    const results: string[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunkPrompt = `Phần ${i + 1}/${chunks.length}:\n${chunks[i]}\n\nHãy phân tích phần này và tóm tắt ngắn gọn.`;
      const result = await this.generateContent(chunkPrompt, systemPrompt);
      results.push(result);
    }
    
    // Combine results
    const combinedPrompt = `Tổng hợp các phân tích sau thành một báo cáo hoàn chình:\n\n${results.join('\n\n---\n\n')}`;
    return this.generateContent(combinedPrompt, 'Tạo báo cáo tổng hợp ngắn gọn từ các phân tích đã cho.');
  }

  /**
   * Split text into chunks while trying to preserve meaning
   */
  private splitIntoChunks(text: string, maxChunkSize: number): string[] {
    const chunks: string[] = [];
    const lines = text.split('\n');
    let currentChunk = '';
    
    for (const line of lines) {
      if (currentChunk.length + line.length + 1 > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = line;
      } else {
        currentChunk += (currentChunk ? '\n' : '') + line;
      }
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  /**
   * Check if LM Studio server is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.client.get('/v1/models', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      this.logger.warn('LM Studio health check failed:', error?.message);
      return false;
    }
  }

  /**
   * Get available models from LM Studio
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await this.client.get('/v1/models');
      const models = response.data?.data || [];
      return models.map((model: any) => model.id);
    } catch (error) {
      this.logger.error('Failed to get models from LM Studio:', error?.message);
      return [];
    }
  }
}
