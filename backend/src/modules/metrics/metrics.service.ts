/* eslint-disable prettier/prettier */
// src/modules/metrics/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MetricsService {
    constructor(private readonly prisma: PrismaService) { }

    /** Total de visitantes únicos */
    async totalVisitors(): Promise<{ totalVisitors: number }> {
        const totalVisitors = await this.prisma.accessLog.groupBy({
            by: ['userId'],
        }).then(result => result.length);
        return { totalVisitors };
    }


    async averageDailyAccess(days = 7): Promise<{ averageDailyAccess: number }> {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const total = await this.prisma.accessLog.count({
            where: { timestamp: { gte: since } }
        });
        return { averageDailyAccess: total / days };
    }
}
