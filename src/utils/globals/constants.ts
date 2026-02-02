export const SUBJECTS_JWT = {
  auth_token: 'auth_token',
  oauth_google: 'oauth_google',
};

export const PREFIX_API = 'api';

export enum WHATSAPP_SESSION_STATUS {
  NOT_LOGGED = 'notLogged', // No autenticado
  QR_GENERATED = 'qrGenerated', // QR generado (esperando escaneo)
  QR_SCANNED = 'qrReadSuccess', // QR escaneado
  IN_CHAT = 'inChat', // Conectado y listo
  DISCONNECTED = 'disconnected', // Sesión caída
}
export const FOLDER_WPP_SESSIONS = './wpp-sessions';
export const PREFIX_WPP_SESSION_NAME = 'identification_';
/*
Uses cases

NOT_LOGGED	Mostrar botón Conectar
QR_GENERATED	Mostrar QR
QR_SCANNED	Mostrar “Verificando…”
IN_CHAT	Habilitar envío
DISCONNECTED	Reintentar conexión

*/
