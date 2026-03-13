// export class EvolutionWebhookDto {
//   /** Nombre del evento: 'QRCODE_UPDATED' | 'CONNECTION_UPDATE' | etc. */
//   event: string;

//   /** Nombre de la instancia (= session_name en tu BD) */
//   instance: string;

//   /** Payload específico del evento */
//   data: {
//     // QRCODE_UPDATED
//     qrcode?: {
//       base64?: string;
//       code?: string;
//     };

//     // CONNECTION_UPDATE
//     state?: 'open' | 'close' | 'connecting' | string;
//     instance?: {
//       owner?: string; // JID del número conectado: "5491155556666@s.whatsapp.net"
//       profileName?: string;
//     };
//   };
// }
// evolution-webhook.dto.ts
import { IsOptional } from 'class-validator';

export class EvolutionWebhookDto {
  @IsOptional()
  event?: string;

  @IsOptional()
  instance?: string;

  @IsOptional()
  data?: any;

  @IsOptional()
  destination?: string;

  @IsOptional()
  date_time?: string;

  @IsOptional()
  server_url?: string;

  @IsOptional()
  apikey?: string;
}
