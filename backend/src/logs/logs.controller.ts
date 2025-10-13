/* eslint-disable prettier/prettier */
import { Controller, Post, Body } from '@nestjs/common';
import { LogsService } from './logs.service';

@Controller('logs')
export class LogsController {
    constructor(private readonly logsService: LogsService) { }

    @Post()
    async create(@Body() body: { userId: string; action: string; metadata?: any }) {
        return this.logsService.create(body.userId, body.action, body.metadata);
    }
}
