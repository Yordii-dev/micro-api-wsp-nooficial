import { IsNumber, IsString } from 'class-validator';

export class SendMessageDto {
  @IsNumber()
  identification: Number;

  @IsString()
  destination: string;

  @IsString()
  message: string;
}
