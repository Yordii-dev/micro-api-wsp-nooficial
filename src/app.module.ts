import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { MastersModule } from './masters/masters.module';
import { PrismaModule } from '@utils/prisma/prisma.module';
import { AuthModule } from 'auth/auth.module';
import { MessagingModule } from 'messaging/messaging.module';

@Module({
  imports: [
    //CORE MODULES
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', `.env.${process.env.NODE_ENV}`],
    }),
    ScheduleModule.forRoot({}),
    MastersModule,
    PrismaModule,

    //APP MODULES
    AuthModule,
    MastersModule,
    MessagingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
