// frontend/services/userService.ts
import { getAuth } from 'firebase/auth';

export interface User {
    id: number;
    name: string;
    role: string;
    email?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL!;

async function getIdToken(): Promise<string> {
    const user = getAuth().currentUser;
    if (!user) throw new Error('Usuário não autenticado');
    return user.getIdToken(/* forceRefresh */ true);
}

export async function fetchUsers(): Promise<User[]> {
    const token = await getIdToken();
    const res = await fetch(`${API}/users`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Erro ao buscar usuários (${res.status}): ${txt}`);
    }
    return res.json();
}
