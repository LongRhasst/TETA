import { Injectable, Logger } from '@nestjs/common';
import { MezonClient } from 'mezon-sdk';

@Injectable()
export class MezonService {
    private readonly logger = new Logger(MezonService.name);
    private client: MezonClient;

    constructor() {
        this.client = new MezonClient(
            process.env.MEZON_TOKEN,
        );
    }

    async initializeClient() {
        try {
            this.logger.log('Initializing Mezon client...');
            const result = await this.client.login();
            this.logger.log('Mezon client initialized successfully.');
        } catch (error) {
            this.logger.error('Error initializing Mezon client:', error);
        }
    }

    getClient() {
        return this.client;
    }
}

