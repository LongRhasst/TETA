import { Module } from '@nestjs/common';
import { FormCommand } from './form.command';
import { FormService } from './form.service';
import { MezonModule } from 'src/v2/mezon/mezon.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [MezonModule, EventEmitterModule],
  providers: [FormCommand, FormService],
  exports: [FormCommand, FormService],
})
export class FormDataModule {}