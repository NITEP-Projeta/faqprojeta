import { MetricsService } from './metrics.service';
export declare class MetricsController {
    private readonly metricsService;
    constructor(metricsService: MetricsService);
    getDaily(days?: string): Promise<{
        date: string;
        count: number;
    }[]>;
    getMonthly(months?: string): Promise<{
        month: string;
        count: number;
    }[]>;
}
