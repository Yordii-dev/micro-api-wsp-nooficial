import { WHATSAPP_SESSION_STATUS } from '@utils/globals/constants';
import { extractPhoneFromWid } from './extract-phone';
import { PrismaService } from '@utils/prisma/prisma.service';

export const onStatusWpp = async (
  session_name: string,
  status: string,
  client: any,
  prisma: PrismaService,
) => {
  if (
    status !== WHATSAPP_SESSION_STATUS.QR_SCANNED &&
    status !== WHATSAPP_SESSION_STATUS.IN_CHAT
  ) {
    return prisma.whatsappSession.update({
      where: { session_name },
      data: { session_state: status },
    });
  }

  try {
    const wid = await client.getWid();
    const phone = extractPhoneFromWid(wid);

    return prisma.whatsappSession.update({
      where: { session_name },
      data: {
        session_state: status,
        phone,
        status: true,
      },
    });
  } catch {
    return prisma.whatsappSession.update({
      where: { session_name },
      data: { session_state: status },
    });
  }
};
