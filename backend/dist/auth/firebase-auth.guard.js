"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FirebaseAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const firebase_admin_1 = require("../firebase/firebase.admin");
let FirebaseAuthGuard = class FirebaseAuthGuard {
    async canActivate(ctx) {
        const req = ctx.switchToHttp().getRequest();
        const auth = req.headers.authorization;
        if (!auth?.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Token não fornecido');
        }
        const idToken = auth.split(' ')[1];
        try {
            const decoded = await firebase_admin_1.admin.auth().verifyIdToken(idToken);
            req.user = { uid: decoded.uid, email: decoded.email };
            return true;
        }
        catch {
            throw new common_1.UnauthorizedException('Token inválido');
        }
    }
};
exports.FirebaseAuthGuard = FirebaseAuthGuard;
exports.FirebaseAuthGuard = FirebaseAuthGuard = __decorate([
    (0, common_1.Injectable)()
], FirebaseAuthGuard);
//# sourceMappingURL=firebase-auth.guard.js.map