import { defineConfig } from '@prisma/config';
import path from 'path';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    path: path.join('prisma', 'migrations'),
    seed: isProd
      ? 'node dist/src/utils/prisma/seed/seed.js'
      : 'ts-node --compiler-options {"module":"CommonJS"} src/utils/prisma/seed/seed.ts',
  },
});
