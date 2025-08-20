const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchDailyActive(days: number) {
    const res = await fetch(`${API_URL}/metrics/daily-active?days=${days}`);
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return res.json();
}

export async function fetchMonthlyActive(months: number) {
    const res = await fetch(`${API_URL}/metrics/monthly-active?months=${months}`);
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return res.json();
}

export async function fetchUsers() {
    const res = await fetch(`${API_URL}/users`);
    if (!res.ok) throw new Error(`Erro ${res.status}`);
    return res.json();
}
