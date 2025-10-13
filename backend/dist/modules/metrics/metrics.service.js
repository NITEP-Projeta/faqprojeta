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
const firebase_service_1 = require("../../shared/firebase.service");
let MetricsService = class MetricsService {
    firebase;
    constructor(firebase) {
        this.firebase = firebase;
    }
    async totalVisitors() {
        const fs = this.firebase.firestore();
        const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const snap = await fs
            .collection('accessLogs')
            .where('ts', '>=', since)
            .get();
        const unique = new Set();
        snap.forEach(d => {
            const v = d.data();
            if (v?.userId)
                unique.add(String(v.userId));
        });
        return { totalVisitors: unique.size };
    }
    async activeTrainings() {
        const fs = this.firebase.firestore();
        const since = Date.now() - 30 * 24 * 60 * 60 * 1000;
        const snap = await fs
            .collection('trainingProgress')
            .where('watchedMinutes', '>', 0)
            .where('updatedAt', '>=', since)
            .get();
        const setIds = new Set();
        snap.forEach(d => {
            const v = d.data();
            if (v?.trainingId)
                setIds.add(String(v.trainingId));
        });
        return { activeTrainings: setIds.size };
    }
    async averageDailyAccess(days = 7) {
        const fs = this.firebase.firestore();
        const since = Date.now() - days * 24 * 60 * 60 * 1000;
        const snap = await fs
            .collection('accessLogs')
            .where('ts', '>=', since)
            .get();
        const totalAccesses = snap.size;
        return { averageDailyAccess: totalAccesses / days };
    }
    async dailyAccess(days = 30) {
        const fs = this.firebase.firestore();
        const now = new Date();
        const sinceMs = now.getTime() - days * 24 * 60 * 60 * 1000;
        const snap = await fs
            .collection('accessLogs')
            .where('ts', '>=', sinceMs)
            .get();
        const counts = new Map();
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
            const key = d.toISOString().slice(0, 10);
            counts.set(key, 0);
        }
        snap.forEach(doc => {
            const v = doc.data();
            const ts = typeof v?.ts === 'number' ? v.ts : (v?.ts?.toMillis ? v.ts.toMillis() : null);
            if (!ts)
                return;
            const d = new Date(ts);
            const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
            counts.set(key, (counts.get(key) || 0) + 1);
        });
        const daysArr = Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0])).map(([date, count]) => ({ date, count }));
        return { days: daysArr };
    }
    async weeklyAccess(weeks = 8) {
        const fs = this.firebase.firestore();
        const now = new Date();
        const sinceMs = now.getTime() - weeks * 7 * 24 * 60 * 60 * 1000;
        const snap = await fs
            .collection('accessLogs')
            .where('ts', '>=', sinceMs)
            .get();
        const buckets = [];
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const day = start.getDay();
        start.setDate(start.getDate() - day);
        for (let i = weeks - 1; i >= 0; i--) {
            const s = new Date(start);
            s.setDate(s.getDate() - i * 7);
            const e = new Date(s);
            e.setDate(e.getDate() + 6);
            e.setHours(23, 59, 59, 999);
            const label = `S${weeks - i}`;
            buckets.push({ start: s, end: e, label, count: 0 });
        }
        snap.forEach(doc => {
            const v = doc.data();
            const ts = typeof v?.ts === 'number' ? v.ts : (v?.ts?.toMillis ? v.ts.toMillis() : null);
            if (!ts)
                return;
            for (const b of buckets) {
                if (ts >= b.start.getTime() && ts <= b.end.getTime()) {
                    b.count += 1;
                    break;
                }
            }
        });
        return { weeks: buckets.map(b => ({ label: b.label, count: b.count })) };
    }
    async usersByRole() {
        const fs = this.firebase.firestore();
        const snap = await fs.collection('users').get();
        const map = new Map();
        snap.forEach(d => {
            const v = d.data();
            const role = String(v?.role || 'Desconhecido');
            map.set(role, (map.get(role) || 0) + 1);
        });
        const segments = Array.from(map.entries()).map(([name, value]) => ({ name, value }));
        return { segments };
    }
};
exports.MetricsService = MetricsService;
exports.MetricsService = MetricsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], MetricsService);
//# sourceMappingURL=metrics.service.js.map