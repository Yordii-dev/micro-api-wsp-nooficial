import { IsNumber, IsString } from 'class-validator';

export class ConnectDto {
  @IsNumber()
  user_id: number;
}
