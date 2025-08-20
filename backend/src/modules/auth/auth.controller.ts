/* eslint-disable prettier/prettier */
import { Controller, Post } from '@nestjs/common';

@Controller('auth')
export class AuthController {
    @Post('login')
    login() {
        // Aqui você pode adicionar lógica real depois
        return { message: 'Login registrado (simulado)' };
    }
}
