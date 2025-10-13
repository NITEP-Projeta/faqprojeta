/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable prettier/prettier */
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':uid')
    findOne(@Param('uid') uid: string) {
        return this.usersService.findOne(uid);
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Patch(':uid')
    update(
        @Param('uid') uid: string,
        @Body() createUserDto: CreateUserDto,
    ) {
        return this.usersService.update(uid, createUserDto);
    }

    @Delete(':uid')
    remove(@Param('uid') uid: string) {
        return this.usersService.remove(uid);
    }
}
