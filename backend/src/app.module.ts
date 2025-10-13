/* eslint-disable prettier/prettier */
// src/app.module.ts
import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { MetricsModule } from './modules/metrics/metrics.module';

@Module({
  imports: [
    UsersModule,
    MetricsModule,
  ],
})
export class AppModule { }
