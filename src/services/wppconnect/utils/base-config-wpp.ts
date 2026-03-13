import { FOLDER_WPP_SESSIONS } from '@utils/globals/constants';

export const baseConfigWpp = (session_name: string) => {
  return {
    session: session_name,
    folderNameToken: `${FOLDER_WPP_SESSIONS}`,
    // autoClose: 0,
    autoClose: 99999999, //prácticamente nunca cierra solo
    whatsappVersion: '2.3000',
    puppeteerOptions: {
      headless: true,
      args: ['--no-sandbox'],
      // args: [
      //   '--no-sandbox',
      //   '--disable-setuid-sandbox',
      //   '--disable-dev-shm-usage', // Importante en Docker
      //   '--disable-gpu',
      // ],
      userDataDir: `${FOLDER_WPP_SESSIONS}/${session_name}`,
    },
  };
};
