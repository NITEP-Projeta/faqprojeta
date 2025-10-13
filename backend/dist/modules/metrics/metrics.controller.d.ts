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
    getDailyAccess(days?: string): Promise<{
        days: Array<{
            date: string;
            count: number;
        }>;
    }>;
    getWeeklyAccess(weeks?: string): Promise<{
        weeks: Array<{
            label: string;
            count: number;
        }>;
    }>;
    getUsersByRole(): Promise<{
        segments: Array<{
            name: string;
            value: number;
        }>;
    }>;
}
