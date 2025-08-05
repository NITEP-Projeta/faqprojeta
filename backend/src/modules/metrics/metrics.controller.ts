/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
// src/modules/metrics/metrics.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
    constructor(private readonly metricsService: MetricsService) { }

    @Get('visitors')
    getVisitors() {
        return this.metricsService.totalVisitors();
    }

    @Get('active-trainings')
    getActiveTrainings() {
        return this.metricsService.activeTrainings();
    }

    @Get('avg-daily-access')
    getAverageDailyAccess(@Query('days') days?: string) {
        const d = days ? parseInt(days, 10) : 7;
        return this.metricsService.averageDailyAccess(d);
    }
}
