import { Injectable } from '@nestjs/common';
import { ChannelMessage } from 'mezon-sdk';
import { promises as fs } from 'fs';
import * as path from 'path';
import { MessageType } from '../types/komu.types';

@Injectable()
export class KomuExportService {
  /**
   * Export message data to JSON file for backup/debugging
   */
  async exportToJson(message: ChannelMessage, messageType: MessageType) {
    const content = typeof (message as any)?.content === 'string'
      ? (message as any).content
      : message?.content?.t ?? '';

    const dir = path.resolve(process.cwd(), 'generated', 'komu-samples');
    await fs.mkdir(dir, { recursive: true });
    
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const file = path.join(
      dir,
      `komu_${messageType}_${ts}_${message.message_id ?? 'unknown'}.json`,
    );
    
    const sample = {
      type: messageType,
      message_id: message.message_id,
      channel_id: message.channel_id,
      clan_id: message.clan_id,
      sender_id: message.sender_id,
      username: message.username,
      display_name: message.display_name,
      code: message.code,
      content_text: content,
      content_raw: (message as any).content,
      references: message.references,
      create_time: (message as any).create_time,
      update_time: (message as any).update_time,
    };
    
    await fs.writeFile(file, JSON.stringify(sample, null, 2), 'utf8');
  }
}
