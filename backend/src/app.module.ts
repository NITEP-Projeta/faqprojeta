/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UsersModule } from './modules/users/users.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    SharedModule, // ✅ disponibiliza FirebaseService globalmente
    UsersModule,
    MetricsModule,
  ],
})
export class AppModule { }
