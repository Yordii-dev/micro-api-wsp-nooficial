export function extractPhoneFromWid(wid: string): string {
  return '+' + wid.replace('@c.us', '');
}
