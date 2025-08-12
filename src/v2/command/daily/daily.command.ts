import { DailyService } from "./daily.service";
import { ChannelMessage } from "mezon-sdk/dist/cjs/api/api";
import { OnEvent } from "@nestjs/event-emitter";
import { Injectable } from "@nestjs/common";
import { MezonSendChannelMessage } from "../../mezon/type/mezon";
import { MezonClient } from "mezon-sdk";
import { Logger } from "@nestjs/common";

@Injectable()
export class DailyCommand {
    private readonly logger = new Logger(DailyCommand.name);
    private readonly mezonClient: MezonClient;

    constructor(
        private readonly dailyService: DailyService,
    ) {
        this.mezonClient = dailyService.getMezonClient();
        this.logger.log(`Listening for event: ChannelMessage`);
    }
}