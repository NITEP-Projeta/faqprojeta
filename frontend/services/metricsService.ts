export type VisitorsResponse = { totalVisitors: number };

export async function fetchTotalVisitors(): Promise<VisitorsResponse> {
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/metrics/visitors`
    );
    if (!res.ok) throw new Error('Falha ao buscar total de visitantes');
    return res.json();
}
