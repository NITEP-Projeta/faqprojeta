import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        uid: string;
        email: string | undefined;
        displayName: string | undefined;
        disabled: boolean;
    }[]>;
    findOne(uid: string): Promise<import("firebase-admin/lib/auth/user-record").UserRecord>;
    create(createUserDto: CreateUserDto): Promise<import("firebase-admin/lib/auth/user-record").UserRecord>;
    update(uid: string, createUserDto: CreateUserDto): Promise<import("firebase-admin/lib/auth/user-record").UserRecord>;
    remove(uid: string): Promise<void>;
}
