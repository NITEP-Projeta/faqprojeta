import { PrismaService } from 'src/prisma/prisma.service';
export declare class MetricsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    dailyActiveUsers(days?: number): Promise<{
        date: string;
        count: number;
    }[]>;
    monthlyActiveUsers(months?: number): Promise<{
        month: string;
        count: number;
    }[]>;
}
