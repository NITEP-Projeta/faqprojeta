/* eslint-disable prettier/prettier */
import { Controller, Get, Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
    constructor(private readonly metricsService: MetricsService) { }

    @Get('daily-active')
    getDaily(@Query('days') days?: string) {
        return this.metricsService.dailyActiveUsers(days ? +days : 30);
    }

    @Get('monthly-active')
    getMonthly(@Query('months') months?: string) {
        return this.metricsService.monthlyActiveUsers(months ? +months : 6);
    }
}
