export interface VisitorsResponse {
    totalVisitors: number;
}
export interface ActiveTrainingsResponse {
    activeTrainings: number;
}
export interface AvgDailyAccessResponse {
    averageDailyAccess: number;
}

const API = process.env.NEXT_PUBLIC_API_URL!;

export async function fetchTotalVisitors(): Promise<VisitorsResponse> {
    const res = await fetch(`${API}/metrics/visitors`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function fetchActiveTrainings(): Promise<ActiveTrainingsResponse> {
    const res = await fetch(`${API}/metrics/active-trainings`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function fetchAvgDailyAccess(days = 7): Promise<AvgDailyAccessResponse> {
    const res = await fetch(`${API}/metrics/avg-daily-access?days=${days}`);
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}
