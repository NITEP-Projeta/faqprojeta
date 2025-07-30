/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
// src/modules/metrics/metrics.controller.ts
import { Controller, Get } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
    constructor(private readonly metricsService: MetricsService) { }

    /** Agora mapeia GET /metrics/visitors */
    @Get('visitors')
    async getVisitors() {
        return this.metricsService.totalVisitors();
    }
}
