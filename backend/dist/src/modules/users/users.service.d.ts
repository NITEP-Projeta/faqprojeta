import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): any;
    findOne(id: number): any;
    create(data: CreateUserDto): any;
    update(id: number, data: CreateUserDto): any;
    remove(id: number): any;
}
