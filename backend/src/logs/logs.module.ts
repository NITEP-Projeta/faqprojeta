/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common'
import { LogsController } from './logs.controller'
import { LogsService } from './logs.service'
import { FirebaseService } from '../shared/firebase.service';

@Module({
    controllers: [LogsController],
    providers: [LogsService, FirebaseService],
})
export class LogsModule { }
