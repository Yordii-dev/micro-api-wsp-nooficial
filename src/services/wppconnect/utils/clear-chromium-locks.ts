import { FOLDER_WPP_SESSIONS } from '@utils/globals/constants';
import { existsSync, readdirSync, rmSync } from 'fs';
import { join } from 'path';

// ✅ Limpia TODOS los archivos de lock que deja Chromium
export const cleanChromiumLocks = (session_name: string) => {
  const sessionDir = join(FOLDER_WPP_SESSIONS, session_name);
  if (!existsSync(sessionDir)) return;

  // Archivos de lock conocidos de Chromium/Puppeteer
  const exactLockFiles = [
    'SingletonLock',
    'SingletonSocket',
    'SingletonCookiesLock',
    'lockfile', // true
    '.org.chromium.Chromium.XXXXXX', // temp lock
  ];

  for (const file of exactLockFiles) {
    const filePath = join(sessionDir, file);
    if (existsSync(filePath)) {
      try {
        rmSync(filePath, { force: true });
        console.log(`🔓 Lock eliminado: ${filePath}`);
      } catch (e) {
        console.warn(`⚠️ No se pudo eliminar ${filePath}:`, e.message);
      }
    }
  }

  // También busca archivos que empiecen con "Singleton" dinámicamente
  try {
    const files = readdirSync(sessionDir);
    for (const file of files) {
      if (file.startsWith('Singleton') || file === 'lockfile') {
        const filePath = join(sessionDir, file);
        try {
          rmSync(filePath, { force: true });
          console.log(`🔓 Lock dinámico eliminado: ${filePath}`);
        } catch {}
      }
    }
  } catch {}
};
