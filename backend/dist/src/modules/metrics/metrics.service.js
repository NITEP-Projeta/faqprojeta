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
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let MetricsService = class MetricsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    d;
    async totalVisitors() {
        const total = await this.prisma.accessLog.groupBy({
            by: ['userId'],
        }).then(result => result.length);
        return { totalVisitors: total };
    }
    async activeTrainings() {
        const total = await this.prisma.trainingProgress.groupBy({
            by: ['trainingId'],
            where: { watchedMinutes: { gt: 0 } },
        }).then(result => result.length);
        return { activeTrainings: total };
    }
    async averageDailyAccess(days = 7) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const totalAccesses = await this.prisma.accessLog.count({
            where: { timestamp: { gte: since } },
        });
        return { averageDailyAccess: totalAccesses / days };
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map