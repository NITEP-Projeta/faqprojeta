/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase.service';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  providers: [FirebaseService, UsersService],
  controllers: [UsersController]
})
export class UsersModule { }
