import { 
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  VertexAI,
  HarmCategory,
  HarmBlockThreshold,
  type GenerateContentResult,
} from '@google-cloud/vertexai';

@Injectable()
export class VertexAIService {
  private vertex: VertexAI;
  private model: any;

  constructor (private configService: ConfigService){
    this.vertex = new VertexAI({
      project: this.configService.get('AI_PROJECT_ID'),
      location: this.configService.get('AI_LOCATION'),
    })

    this.model = this.vertex.preview.getGenerativeModel({
      model: this.configService.get('AI_MODEL')!,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        }
      ],
      systemInstruction: 'only return true JSON schema, no explanations',
      responseMIMEType: 'application/json',
      
    })
  }

  async generateContent(prompt: string): Promise<string>{
    try {
      const result = await this.model.generateContent(prompt);
      const response = result.response;

      if (!response.candidates || response.candidates.length === 0) {
        throw new Error('No candidates returned from Vertex AI');

      }

      const candidate = response.candidates[0];
      if(!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0){
        throw new Error('No content returned from Vertex AI');
      }

      return candidate.content.parts[0].text || 'No text content available';
    }
    catch (error) {
      console.error('Error generating content:', error);
      throw new Error('Failed to generate content');
    }
  }
}