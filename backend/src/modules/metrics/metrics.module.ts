/* eslint-disable prettier/prettier */
// src/modules/metrics/metrics.module.ts
import { Module } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase.service';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';

@Module({
    providers: [FirebaseService, MetricsService],
    controllers: [MetricsController],
})
export class MetricsModule { }
