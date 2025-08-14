import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ChannelMessage, Events, TypeMessage } from 'mezon-sdk';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class KomuReplyListener {
  @OnEvent(Events.ChannelMessage)
  async handleKomuReply(message: ChannelMessage) {
    const content = typeof (message as any)?.content === 'string'
      ? (message as any).content
      : message?.content?.t ?? '';
    const isKomu =
      message.username?.toUpperCase?.() === 'KOMU' ||
      message.display_name?.toUpperCase?.() === 'KOMU';
    const isReply = Array.isArray(message.references) && message.references.length > 0;
    const isUpdate = message.code === TypeMessage.ChatUpdate;
    console.log(`${message.code}`)
    console.log(`${isReply}`)
    console.log(`${isUpdate}`);

    // Parse referenced content if present; it may be JSON string like {"t":"*daily"}
    let refText = '';
    if (isReply) {
      const raw = message.references?.[0]?.content ?? '';
      if (typeof raw === 'string') {
        try {
          const parsed = JSON.parse(raw);
          refText = typeof parsed?.t === 'string' ? parsed.t : raw;
        } catch {
          refText = raw;
        }
      }
    }

    const hasDailyInContent = /\*daily\b/i.test(content);
    const looksLikeDailyUpdate = /(daily saved|\bdate:|\byesterday:|\btoday:|\bblock:|\bworking\s*time:)/i.test(content);
    const hasDailyInRef = /\*daily\b/i.test(refText);

    if (isKomu && (hasDailyInContent || looksLikeDailyUpdate || (isReply && hasDailyInRef))) {
      console.log('KOMU activity detected:', {
        type: isUpdate ? 'update' : 'reply',
        message_id: message.message_id,
        channel_id: message.channel_id,
        clan_id: message.clan_id,
        content,
        references: message.references,
        code: message.code,
      });

      // Export captured data to JSON for further processing
      try {
        const dir = path.resolve(process.cwd(), 'generated', 'komu-samples');
        await fs.mkdir(dir, { recursive: true });
        const ts = new Date().toISOString().replace(/[:.]/g, '-');
        const file = path.join(
          dir,
          `komu_daily_${isUpdate ? 'update' : 'reply'}_${ts}_${message.message_id ?? 'unknown'}.json`,
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
          content_raw: (message as any).content,
          references: message.references,
          create_time: (message as any).create_time,
          update_time: (message as any).update_time,
        } as const;
        await fs.writeFile(file, JSON.stringify(sample, null, 2), 'utf8');
      } catch (err) {
        console.error('Failed to export KOMU daily JSON:', err);
      }
    }
  }
}