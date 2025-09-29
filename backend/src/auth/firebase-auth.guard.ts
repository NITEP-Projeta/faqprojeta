/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const req = ctx.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: any }>();
        const authHeader = req.headers.authorization;

        if (!authHeader?.startsWith('Bearer ')) {
            throw new UnauthorizedException('Token não fornecido');
        }

        const idToken = authHeader.split(' ')[1];
        try {
            const decoded = await admin.auth().verifyIdToken(idToken);
            req.user = { uid: decoded.uid, email: decoded.email };
            return true;
        } catch {
            throw new UnauthorizedException('Token inválido');
        }
    }
}
