import { IsNumber, IsString } from 'class-validator';

export class ConnectDto {
  @IsNumber()
  identification: number;
}
