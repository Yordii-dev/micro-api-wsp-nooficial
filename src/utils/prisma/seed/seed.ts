import { NestFactory } from '@nestjs/core';
import { SeedModule } from './seed.module';
import { SeedService } from './seed.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(SeedModule);
  const seedService = app.get(SeedService);

  await seedService.run();

  await app.close();
}

bootstrap()
  .then(() => console.log('Seeding terminado ✅'))
  .catch((e) => console.error(e));
