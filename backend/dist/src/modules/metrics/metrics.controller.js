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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetricsController = void 0;
const common_1 = require("@nestjs/common");
const metrics_service_1 = require("./metrics.service");
let MetricsController = class MetricsController {
    metricsService;
    constructor(metricsService) {
        this.metricsService = metricsService;
    }
    getVisitors() {
        return this.metricsService.totalVisitors();
    }
    getActiveTrainings() {
        return this.metricsService.activeTrainings();
    }
    getAverageDailyAccess(days) {
        const d = days ? parseInt(days, 10) : 7;
        return this.metricsService.averageDailyAccess(d);
    }
};
exports.MetricsController = MetricsController;
__decorate([
    (0, common_1.Get)('visitors'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "getVisitors", null);
__decorate([
    (0, common_1.Get)('active-trainings'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "getActiveTrainings", null);
__decorate([
    (0, common_1.Get)('avg-daily-access'),
    __param(0, (0, common_1.Query)('days')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], MetricsController.prototype, "getAverageDailyAccess", null);
exports.MetricsController = MetricsController = __decorate([
    (0, common_1.Controller)('metrics'),
    __metadata("design:paramtypes", [metrics_service_1.MetricsService])
], MetricsController);
//# sourceMappingURL=metrics.controller.js.map