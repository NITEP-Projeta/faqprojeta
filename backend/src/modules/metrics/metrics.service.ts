/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

/* eslint-disable prettier/prettier */
@Injectable()
export class MetricsService {
    constructor(private readonly prisma: PrismaService) { } d

    // visitantes únicos
    async totalVisitors(): Promise<{ totalVisitors: number }> {
        const total = await this.prisma.accessLog.groupBy({
            by: ['userId'],
        }).then(result => result.length);
        return { totalVisitors: total };
    }

    // treinamentos ativos (ou seja: com progress > 0)
    async activeTrainings(): Promise<{ activeTrainings: number }> {
        const total = await this.prisma.trainingProgress.groupBy({
            by: ['trainingId'],
            where: { watchedMinutes: { gt: 0 } },
        }).then(result => result.length);
        return { activeTrainings: total };
    }

    // acesso médio diário nos últimos N dias
    async averageDailyAccess(days = 7): Promise<{ averageDailyAccess: number }> {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const totalAccesses = await this.prisma.accessLog.count({
            where: { timestamp: { gte: since } },
        });
        return { averageDailyAccess: totalAccesses / days };
    }
}
