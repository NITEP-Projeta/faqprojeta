import { MetricsService } from './metrics.service';
export declare class MetricsController {
    private readonly metricsService;
    constructor(metricsService: MetricsService);
    getVisitors(): Promise<{
        totalVisitors: number;
    }>;
    getActiveTrainings(): Promise<{
        activeTrainings: number;
    }>;
    getAverageDailyAccess(days?: string): Promise<{
        averageDailyAccess: number;
    }>;
}
