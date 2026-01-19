import { IsNumber, IsString } from 'class-validator';

export class SendMessageDto {
  @IsNumber()
  user_id: Number;

  @IsString()
  remitente: string;

  @IsString()
  destino: string;

  @IsString()
  mensaje: string;
}
