/* eslint-disable prettier/prettier */
// src/app.module.ts
import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { MetricsModule } from './modules/metrics/metrics.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    MetricsModule,
  ],
})
export class AppModule { }
