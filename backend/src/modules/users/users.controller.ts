/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Post, Body, Put, Delete } from '@nestjs/common';
import { UsersService } from './users.service';

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
    create(@Body() body: { email: string; password: string; displayName?: string }) {
        return this.usersService.create(body);
    }

    @Put(':uid')
    update(@Param('uid') uid: string, @Body() body: { email?: string; password?: string; displayName?: string }) {
        return this.usersService.update(uid, body);
    }

    @Delete(':uid')
    remove(@Param('uid') uid: string) {
        return this.usersService.remove(uid);
    }
}
