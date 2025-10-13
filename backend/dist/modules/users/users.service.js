"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const firebase_service_1 = require("../../shared/firebase.service");
let UsersService = class UsersService {
    firebase;
    constructor(firebase) {
        this.firebase = firebase;
    }
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
    async findOne(uid) {
        const auth = this.firebase.auth();
        return auth.getUser(uid);
    }
    async create(data) {
        const auth = this.firebase.auth();
        return auth.createUser({
            email: data.email,
            password: data.password,
            displayName: data.displayName,
        });
    }
    async update(uid, data) {
        const auth = this.firebase.auth();
        return auth.updateUser(uid, {
            email: data.email,
            password: data.password,
            displayName: data.displayName,
        });
    }
    async remove(uid) {
        const auth = this.firebase.auth();
        return auth.deleteUser(uid);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [firebase_service_1.FirebaseService])
], UsersService);
//# sourceMappingURL=users.service.js.map