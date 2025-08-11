import { ChatDeepSeek } from '@langchain/deepseek';
import { Inject, Injectable } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';

@Injectable()
export class AiService {
  constructor(@Inject('AI') private readonly ai: ChatDeepSeek) {}

  async generateTomtat(storyName: string) {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        'system',
        `### Bạn là một chuyên gia văn học và kể chuyện cổ tích.

        ### Nhiệm vụ:
        - Nhận vào **tên của một câu chuyện cổ tích** (ví dụ: "Tấm Cám", "Cô bé Lọ Lem", "Aladdin", v.v.).
        - Dựa trên kiến thức của bạn, hãy **tóm tắt toàn bộ nội dung** của câu chuyện đó bằng tiếng Việt.
        - **Giới hạn tóm tắt trong tối đa 100 từ.**
        - Viết thành một đoạn văn mạch lạc, súc tích, dễ hiểu cho người Việt Nam.
        - Bắt đầu kết quả với: "Tóm tắt: ..."`,
      ],
      ['human', 'Tên truyện: {input}'],
    ]);

    const chain = prompt.pipe(this.ai);
    const result = await chain.invoke({ input: storyName });

    if (typeof result.content === 'string') {
      return result.content;
    } else if (result.content && typeof result.content === 'object' && 't' in result.content) {
      return (result.content as { t: string }).t;
    } else {
      return JSON.stringify(result.content);
    }
  }
}
