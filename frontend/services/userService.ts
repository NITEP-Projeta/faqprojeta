export type User = { id: number; name: string; role: string };

export async function fetchUsers(): Promise<User[]> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`);
    if (!res.ok) throw new Error('Falha ao buscar usuários');
    return res.json();
}
