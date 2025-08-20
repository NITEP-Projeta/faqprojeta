import api from '../../lib/api'
import { User } from '@/src/types/user'

export async function fetchUsers(): Promise<User[]> {
    const res = await api.get('/users')
    return res.data
}
