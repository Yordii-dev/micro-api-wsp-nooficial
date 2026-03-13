import { FOLDER_WPP_SESSIONS } from '@utils/globals/constants';
import { existsSync } from 'fs';
import { PrismaService } from '@utils/prisma/prisma.service';

export const bootstrapClients = async (
  prisma: PrismaService,
  initClient: (session_name: string, identification: number) => Promise<void>,
) => {
  const sessions = await prisma.whatsappSession.findMany({
    where: { status: true },
  });

  for (const s of sessions) {
    const folderExists = existsSync(`${FOLDER_WPP_SESSIONS}/${s.session_name}`);
    if (folderExists) {
      await initClient(s.session_name, s.identification);
    }
  }
};
