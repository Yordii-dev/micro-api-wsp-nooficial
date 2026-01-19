import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { SendMessageDto } from './dto/send-message.dto';
import { ConnectDto } from './dto/connect.dto';

@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Post('connect')
  async connect(@Body() dto: ConnectDto) {
    return this.messagingService.connectSession(dto);
  }

  @Get('status')
  async status(@Query('user_id') user_id: string) {
    return this.messagingService.getStatus(+user_id);
  }

  @Post('send-message')
  async sendMessage(@Body() dto: SendMessageDto) {
    return this.messagingService.sendMessage(dto);
  }
}
