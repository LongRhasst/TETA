import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ChannelMessage, Events, TypeMessage } from 'mezon-sdk';

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
    }
  }
}


