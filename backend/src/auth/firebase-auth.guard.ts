import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

// Ajuste o caminho se seu arquivo de credenciais estiver em src/firebase
import { admin } from '../firebase/firebase.admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const req = ctx.switchToHttp().getRequest();
        const auth = req.headers.authorization as string;
        if (!auth?.startsWith('Bearer ')) {
            throw new UnauthorizedException('Token não fornecido');
        }

        const idToken = auth.split(' ')[1];
        try {
            const decoded = await admin.auth().verifyIdToken(idToken);
            req.user = { uid: decoded.uid, email: decoded.email };
            return true;
        } catch {
            throw new UnauthorizedException('Token inválido');
        }
    }
}
