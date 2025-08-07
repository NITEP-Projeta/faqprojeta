import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    findAll(): any;
    findOne(id: number): any;
    create(createUserDto: CreateUserDto): any;
    update(id: number, createUserDto: CreateUserDto): any;
    remove(id: number): any;
}
