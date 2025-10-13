/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly firebase: FirebaseService) { }

    /** Retorna todos os usuários do Firebase Auth */
    async findAll() {
        const auth = this.firebase.auth();
        const list = await auth.listUsers();
        return list.users.map(u => ({
            uid: u.uid,
            email: u.email,
            displayName: u.displayName,
            disabled: u.disabled,
        }));
    }

    /** Retorna um usuário pelo UID */
    async findOne(uid: string) {
        const auth = this.firebase.auth();
        return auth.getUser(uid);
    }

    /** Cria um novo usuário no Firebase Auth */
    async create(data: CreateUserDto) {
        const auth = this.firebase.auth();
        return auth.createUser({
            email: data.email,
            password: data.password,
            displayName: data.displayName,
        });
    }

    /** Atualiza um usuário existente no Firebase Auth */
    async update(uid: string, data: CreateUserDto) {
        const auth = this.firebase.auth();
        return auth.updateUser(uid, {
            email: data.email,
            password: data.password,
            displayName: data.displayName,
        });
    }

    /** Remove um usuário pelo UID */
    async remove(uid: string) {
        const auth = this.firebase.auth();
        return auth.deleteUser(uid);
    }
}
