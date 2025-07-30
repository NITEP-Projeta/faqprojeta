/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    /** Retorna todos os usuários */
    findAll() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return this.prisma.user.findMany();
    }

    /** Retorna um usuário pelo ID */
    findOne(id: number) {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    /** Cria um novo usuário */
    create(data: CreateUserDto) {
        return this.prisma.user.create({
            data,
        });
    }

    /** Atualiza um usuário existente */
    update(id: number, data: CreateUserDto) {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    /** Remove um usuário pelo ID */
    remove(id: number) {
        return this.prisma.user.delete({
            where: { id },
        });
    }
}
