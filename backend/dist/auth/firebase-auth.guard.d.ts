import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class FirebaseAuthGuard implements CanActivate {
    canActivate(ctx: ExecutionContext): Promise<boolean>;
}
