/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { FirebaseService } from './firebase/firebase.service';
import { UsersModule } from './modules/users/users.module';
import { MetricsModule } from './modules/metrics/metrics.module';

@Module({
  imports: [UsersModule, MetricsModule],
  providers: [FirebaseService],
  exports: [FirebaseService], // 🔹 exporta p/ outros módulos
})
export class AppModule { }
