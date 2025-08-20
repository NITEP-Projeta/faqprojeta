/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { MetricsController } from './metrics.controller'
import { MetricsService } from './metrics.service'
import { FirebaseService } from './../../firebase/firebase.service'

@Module({
    controllers: [MetricsController],
    providers: [MetricsService, FirebaseService],
})
export class MetricsModule { }
