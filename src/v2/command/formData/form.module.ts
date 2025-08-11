import { Module } from '@nestjs/common';
import { FormCommand } from './form.command';
import { FormService } from './form.service';
import { MezonModule } from 'src/v2/mezon/mezon.module';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AiModule } from 'src/v2/ai/ai.module';

@Module({
  imports: [MezonModule, EventEmitterModule, AiModule],
  providers: [FormCommand, FormService],
  exports: [FormCommand, FormService],
})
export class FormDataModule {}