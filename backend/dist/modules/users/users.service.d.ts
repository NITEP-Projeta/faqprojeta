import { FirebaseService } from '../../shared/firebase.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private readonly firebase;
    constructor(firebase: FirebaseService);
    findAll(): Promise<{
        uid: string;
        email: string | undefined;
        displayName: string | undefined;
        disabled: boolean;
    }[]>;
    findOne(uid: string): Promise<import("firebase-admin/lib/auth/user-record").UserRecord>;
    create(data: CreateUserDto): Promise<import("firebase-admin/lib/auth/user-record").UserRecord>;
    update(uid: string, data: CreateUserDto): Promise<import("firebase-admin/lib/auth/user-record").UserRecord>;
    remove(uid: string): Promise<void>;
}
