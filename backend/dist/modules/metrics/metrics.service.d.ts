import { FirebaseService } from "../../shared/firebase.service";
export declare class MetricsService {
    private readonly firebase;
    constructor(firebase: FirebaseService);
    totalVisitors(): Promise<{
        totalVisitors: number;
    }>;
    activeTrainings(): Promise<{
        activeTrainings: number;
    }>;
    averageDailyAccess(days?: number): Promise<{
        averageDailyAccess: number;
    }>;
    dailyAccess(days?: number): Promise<{
        days: Array<{
            date: string;
            count: number;
        }>;
    }>;
    weeklyAccess(weeks?: number): Promise<{
        weeks: Array<{
            label: string;
            count: number;
        }>;
    }>;
    usersByRole(): Promise<{
        segments: Array<{
            name: string;
            value: number;
        }>;
    }>;
}
