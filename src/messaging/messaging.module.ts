import { Module } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { WhatsappModule } from 'services/wppconnect/whatsapp.module';
import { MessagingGateway } from 'sockets/messaging.gateway';
import { EvolutionApiService } from 'services/evolution/evolution.service';

@Module({
  // imports: [WhatsappModule],
  controllers: [MessagingController],
  providers: [MessagingService, EvolutionApiService, MessagingGateway],

  exports: [MessagingService],
})
export class MessagingModule {}
