import { ChannelMessage } from 'mezon-sdk';
import { Injectable } from "@nestjs/common";
import { MezonService } from "../../mezon/mezon.service";
import { MezonSendChannelMessage } from 'src/v2/mezon/type/mezon';

@Injectable()
export class DailyService {
    constructor(private readonly mezonService: MezonService) {
        this.handleDailyMessage = this.handleDailyMessage.bind(this);
    }

    async handleDailyMessage(message: ChannelMessage) {
        try {
            await this.mezonService.sendChannelMessage({
                type: 'channel',
                clan_id: message.clan_id,
                payload: {
                    channel_id: message.channel_id,
                    message: {
                        type: 'normal_text',
                        content: 'Chào mừng bạn đến với Teta! Hãy bắt đầu ngày mới với những điều thú vị nhé!',
                    },
                }
            });
        } catch (error) {
            console.error('Error handling daily message:', error);
        }
    }
}