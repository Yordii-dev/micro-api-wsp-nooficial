export function normalizeWhatsappNumber(phone: string): string {
  return (
    phone
      .replace(/\s+/g, '')
      .replace('+', '')
      .replace(/[^0-9]/g, '') + '@c.us'
  );
}
