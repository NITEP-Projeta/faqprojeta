/* eslint-disable prettier/prettier */

import { PrismaService } from 'src/prisma/prisma.service';

/* eslint-disable prettier/prettier */
@Injectable()
export class MetricsService {
  constructor(private readonly prisma: PrismaService) { }

  async dailyActiveUsers(days = 30): Promise<{ date: string; count: number }[]> {
    const since = new Date();
    since.setDate(since.getDate() - days);
    return this.prisma.$queryRaw<
      { date: string; count: number }[]
    >`
      SELECT
        to_char(timestamp::date, 'YYYY-MM-DD') as date,
        COUNT(DISTINCT user_id) as count
      FROM "AccessLog"
      WHERE timestamp >= ${since}
      GROUP BY date
      ORDER BY date;
    `;
  }

  async monthlyActiveUsers(months = 6): Promise<{ month: string; count: number }[]> {
    const since = new Date();
    since.setMonth(since.getMonth() - months);
    return this.prisma.$queryRaw<
      { month: string; count: number }[]
    >`
      SELECT
        to_char(timestamp, 'YYYY-MM') as month,
        COUNT(DISTINCT user_id) as count
      FROM "AccessLog"
      WHERE timestamp >= ${since}
      GROUP BY month
      ORDER BY month;
    `;
  }
}
function Injectable(): (target: typeof MetricsService) => void | typeof MetricsService {
  throw new Error("Function not implemented.");
}

