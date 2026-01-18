import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const domainPROD = 'lotiza.com';

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    let hostname: string;
    try {
      hostname = new URL(origin).hostname.toLowerCase();
    } catch {
      // si el origin no es una URL válida, bloquear
      return callback(new Error('Invalid origin format'));
    }

    // Permite dominio y multitenant en producción
    if (hostname === domainPROD || /\.lotiza\.com$/.test(hostname)) {
      return callback(null, true);
    }

    // Permite localhost  y multitenant para desarrollo
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      /\.localhost$/.test(hostname)
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
};
