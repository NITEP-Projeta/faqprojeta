// frontend/services/userService.ts
export interface User {
    id: number;
    name: string;
    email?: string;
    role: string;
}

export async function fetchUsers(): Promise<User[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ao buscar usuários (${res.status}): ${text}`);
    }
    return res.json();
}
