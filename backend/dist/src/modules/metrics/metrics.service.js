"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsService = void 0;
const prisma_service_1 = require("../../prisma/prisma.service");
let MetricsService = class MetricsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async dailyActiveUsers(days = 30) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        return this.prisma.$queryRaw `
      SELECT
        to_char(timestamp::date, 'YYYY-MM-DD') as date,
        COUNT(DISTINCT user_id) as count
      FROM "AccessLog"
      WHERE timestamp >= ${since}
      GROUP BY date
      ORDER BY date;
    `;
    }
    async monthlyActiveUsers(months = 6) {
        const since = new Date();
        since.setMonth(since.getMonth() - months);
        return this.prisma.$queryRaw `
      SELECT
        to_char(timestamp, 'YYYY-MM') as month,
        COUNT(DISTINCT user_id) as count
      FROM "AccessLog"
      WHERE timestamp >= ${since}
      GROUP BY month
      ORDER BY month;
    `;
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MetricsService);
function Injectable() {
    throw new Error("Function not implemented.");
}
//# sourceMappingURL=metrics.service.js.map