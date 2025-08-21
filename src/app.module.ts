import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { FormDataModule } from './v2/command/formData/form.module';
import { CommandModule } from './v2/command/weeklyReport/command.module';
import { MezonModule } from './v2/mezon/mezon.module';
import { PrismaModule } from './prisma/prisma.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MEZON_TOKEN: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
        AI_MODEL: Joi.string().required(),
        AI_LOCATION: Joi.string().optional(),
        AI_PROJECT_ID: Joi.string().required(),
        GOOGLE_APPLICATION_CREDENTIALS: Joi.string().optional(),
      })
    }),
    EventEmitterModule.forRoot(),
    // FormDataModule,
    CommandModule,
    MezonModule,
    PrismaModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
