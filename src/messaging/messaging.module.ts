import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { WhatsappService } from 'services/wppconnect/whatsapp.service';
import { WhatsappModule } from 'services/wppconnect/whatsapp.module';

@Module({
  imports: [WhatsappModule],
  controllers: [MessagingController],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
