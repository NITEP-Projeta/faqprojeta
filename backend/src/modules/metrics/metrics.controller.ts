/* eslint-disable prettier/prettier */
import { Controller, Get, Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { Metric } from './metrics.service';

@Controller('metrics')
export class MetricsController {
    constructor(private readonly metricsService: MetricsService) { }

    @Get('daily-active')
    async getDailyActive(@Query('days') days: string): Promise<Metric[]> {
        const daysNumber = parseInt(days, 10) || 30;
        return this.metricsService.getDailyActive(daysNumber);
    }

    @Get('monthly-active')
    async getMonthlyActive(@Query('months') months: string): Promise<Metric[]> {
        const monthsNumber = parseInt(months, 10) || 12;
        return this.metricsService.getMonthlyActive(monthsNumber);
    }
}
