import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FormDataModule } from './v2/formData/form.module';
import { MezonModule } from './v2/mezon/mezon.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({ 
      isGlobal: true,
      validationSchema: Joi.object({
        MEZON_TOKEN: Joi.string().required(),
        DATABASE_URL: Joi.string().required(),
      })
    }),
    EventEmitterModule.forRoot(),
    FormDataModule, 
    MezonModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
