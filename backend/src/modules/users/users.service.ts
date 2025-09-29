/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase.service';

@Injectable()
export class UsersService {   // 👈 precisa do "export"
    constructor(private readonly firebase: FirebaseService) { }

    async findAll() {
        const auth = this.firebase.auth();
        const listUsers = await auth.listUsers();
        return listUsers.users.map(user => ({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
        }));
    }

    async findOne(uid: string) {
        const auth = this.firebase.auth();
        return auth.getUser(uid);
    }

    async create(data: { email: string; password: string; displayName?: string }) {
        const auth = this.firebase.auth();
        return auth.createUser({
            email: data.email,
            password: data.password,
            displayName: data.displayName,
        });
    }

    async update(uid: string, data: { email?: string; password?: string; displayName?: string }) {
        const auth = this.firebase.auth();
        return auth.updateUser(uid, {
            email: data.email,
            password: data.password,
            displayName: data.displayName,
        });
    }

    async remove(uid: string) {
        const auth = this.firebase.auth();
        return auth.deleteUser(uid);
    }
}
