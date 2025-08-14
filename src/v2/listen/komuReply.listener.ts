import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ChannelMessage, Events, TypeMessage } from 'mezon-sdk';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class KomuReplyListener {
  @OnEvent(Events.ChannelMessage)
  async handleKomuReply(message: ChannelMessage) {
    const content = message?.content?.t ?? '';
    const isKomu =
      message.username?.toUpperCase?.() === 'KOMU' ||
      message.display_name?.toUpperCase?.() === 'KOMU';
    const isReply = Array.isArray(message.references) && message.references.length > 0;
    const isUpdate = message.code === TypeMessage.ChatUpdate;

    if (isKomu && (isReply || isUpdate)) {
      console.log('KOMU activity detected:', {
        type: isUpdate ? 'update' : 'reply',
        message_id: message.message_id,
        channel_id: message.channel_id,
        clan_id: message.clan_id,
        content,
        references: message.references,
        code: message.code,
      });

      // Export sample JSON for cleaning pipeline
      try {
        const dir = path.resolve(process.cwd(), 'generated', 'komu-samples');
        await fs.mkdir(dir, { recursive: true });
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        const file = path.join(
          dir,
          `komu_${isUpdate ? 'update' : 'reply'}_${ts}_${message.message_id ?? 'unknown'}.json`,
        );
        const sample = {
          type: isUpdate ? 'update' : 'reply',
          message_id: message.message_id,
          channel_id: message.channel_id,
          clan_id: message.clan_id,
          sender_id: message.sender_id,
          username: message.username,
          display_name: message.display_name,
          code: message.code,
          content_text: content,
          content_raw: message.content,
          references: message.references,
          create_time: message.create_time,
          update_time: message.update_time,
        } as const;
        await fs.writeFile(file, JSON.stringify(sample, null, 2), 'utf8');
      } catch (err) {
        console.error('Failed to export KOMU sample JSON:', err);
      }
    }
  }
}


