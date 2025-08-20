import { Controller, Get, Query } from '@nestjs/common';
import { MetricsService } from './metrics.service';

@Controller('metrics')
export class MetricsController {
    constructor(private readonly metricsService: MetricsService) { }

    @Get('daily-active')
    async getDailyActive(@Query('days') days: string) {
        return this.metricsService.getDailyActive(Number(days) || 30);
    }

    @Get('monthly-active')
    async getMonthlyActive(@Query('months') months: string) {
        return this.metricsService.getMonthlyActive(Number(months) || 6);
    }
}
