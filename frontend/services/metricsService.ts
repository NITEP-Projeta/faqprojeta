// frontend/services/metricsService.ts
export interface VisitorsResponse {
    totalVisitors: number;
}

export async function fetchTotalVisitors(): Promise<VisitorsResponse> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/metrics/visitors`);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao buscar métricas (${res.status}): ${text}`);
    }
    return res.json();
}
