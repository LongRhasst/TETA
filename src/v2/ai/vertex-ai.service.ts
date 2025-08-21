import { Injectable } from '@nestjs/common';
import { VertexAI } from '@google-cloud/vertexai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class VertexAIService {
  private vertex: VertexAI;
  private model: any;

  constructor(private configService: ConfigService) {
    this.vertex = new VertexAI({
      project: this.configService.get('AI_PROJECT_ID') || 'named-haven-469606-v9',
      location: this.configService.get('AI_LOCATION') || 'us-central1'
    });

    // Initialize the generative model
    this.model = this.vertex.preview.getGenerativeModel({
      model: this.configService.get('AI_MODEL') || 'gemini-2.5-pro',
      generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    });
  }

  async generateContent(prompt: string): Promise<string> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      
      // Safe check for response structure
      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No candidates returned from Vertex AI');
      }
      
      const candidate = response.candidates[0];
      if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        throw new Error('No content parts returned from Vertex AI');
      }
      
      return candidate.content.parts[0].text || 'No text content available';
    } catch (error) {
      console.error('Error generating content with Vertex AI:', error);
      throw new Error(`Failed to generate content: ${error.message}`);
    }
  }

  async generateContentStream(prompt: string): Promise<AsyncGenerator<string, void, unknown>> {
    try {
      const result = await this.model.generateContentStream(prompt);
      
      async function* streamResponse() {
        for await (const chunk of result.stream) {
          if (chunk.candidates && chunk.candidates.length > 0) {
            const candidate = chunk.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
              const chunkText = candidate.content.parts[0].text || '';
              if (chunkText) {
                yield chunkText;
              }
            }
          }
        }
      }

      return streamResponse();
    } catch (error) {
      console.error('Error generating streaming content with Vertex AI:', error);
      throw new Error(`Failed to generate streaming content: ${error.message}`);
    }
  }
}
