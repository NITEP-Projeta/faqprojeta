import { PrismaService } from "../../prisma/prisma.service";
export declare class MetricsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    d: any;
    totalVisitors(): Promise<{
        totalVisitors: number;
    }>;
    activeTrainings(): Promise<{
        activeTrainings: number;
    }>;
    averageDailyAccess(days?: number): Promise<{
        averageDailyAccess: number;
    }>;
}
