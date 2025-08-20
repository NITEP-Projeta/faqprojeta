import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        name: string;
        email: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: number;
        name: string;
        email: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    create(createUserDto: CreateUserDto): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: number;
        name: string;
        email: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    update(id: number, createUserDto: CreateUserDto): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: number;
        name: string;
        email: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    remove(id: number): import(".prisma/client").Prisma.Prisma__UserClient<{
        id: number;
        name: string;
        email: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
}
