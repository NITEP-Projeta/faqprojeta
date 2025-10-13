/* eslint-disable prettier/prettier */
import {
    Controller,
    Post,
    Request,
    UseGuards,
} from '@nestjs/common';

// Caminho do guard sobe dois níveis (modules/auth → src/auth)
import { FirebaseAuthGuard } from '../../auth/firebase-auth.guard';

// Caminho do PrismaService sobe dois níveis (modules/auth → src/prisma)
import { PrismaService } from '../../prisma/prisma.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly prisma: PrismaService) { }

    @UseGuards(FirebaseAuthGuard)
    @Post('login')
    async login(@Request() req) {
        // registre o login etc.
        await this.prisma.accessLog.create({
            data: { userId: Number(req.user.uid) },
        });
        return { message: 'Login registrado' };
    }
}
