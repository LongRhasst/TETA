import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { FormDataModule } from './v2/command/formData/form.module';
import { CommandModule } from './v2/command/weeklyReport/command.module';
import { MezonModule } from './v2/mezon/mezon.module';
import { PrismaModule } from './prisma/prisma.module';
import { AiModule } from './v2/ai/ai.module';
import { CronModule } from './v2/cron/cron.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MEZON_TOKEN: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        LM_STUDIO_API_URL: Joi.string().required(),
        LM_STUDIO_MODEL: Joi.string().required(),
        AI_TIMEOUT: Joi.number().default(120000),
        DEFAULT_REPORT_CHANNEL_ID: Joi.string().optional(),
      })
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    // FormDataModule,
    CommandModule,
    MezonModule,
    PrismaModule,
    CronModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
