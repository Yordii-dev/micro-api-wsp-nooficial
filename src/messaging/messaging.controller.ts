import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ConnectDto } from './dto/connect.dto';
import { EvolutionWebhookDto } from './dto/evolution-webhook.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { MessagingService } from './messaging.service';

@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('connect')
  async connect(@Body() dto: ConnectDto) {
    return this.messagingService.connectSession(dto);
  }

  @Get('status')
  async status(@Query('identification') identification: string) {
    return this.messagingService.getStatus(+identification);
  }

  @Post('send-message')
  async sendMessage(@Body() dto: SendMessageDto) {
    return this.messagingService.sendMessage(dto);
  }
  @Post('webhook/*path')
  @UsePipes()
  async webhookAny(@Body() body: any) {
    console.log('WEBHOOK RECIBIDO:', JSON.stringify(body));
    await this.messagingService.handleWebhook(body);
    return { received: true };
  }

  // // En cada endpoint de webhook:
  // @Post('webhook/connection-update')
  // @UsePipes() // ← pipe vacío, desactiva el global para esta ruta
  // async webhookConnection(@Body() body: any) {
  //   await this.messagingService.handleWebhook({
  //     ...body,
  //     event: 'CONNECTION_UPDATE',
  //   });
  //   return { received: true };
  // }

  // @Post('webhook/qrcode-updated')
  // @UsePipes()
  // async webhookQr(@Body() body: any) {
  //   await this.messagingService.handleWebhook({
  //     ...body,
  //     event: 'QRCODE_UPDATED',
  //   });
  //   return { received: true };
  // }

  // @Post('webhook/:event')
  // @UsePipes()
  // async webhookGeneric(@Param('event') event: string, @Body() body: any) {
  //   this.messagingService['logger'].debug(`Webhook evento ignorado: ${event}`);
  //   return { received: true };
  // }
}
