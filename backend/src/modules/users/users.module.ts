/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { FirebaseService } from '../../firebase/firebase.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, FirebaseService],
  exports: [UsersService],
})
export class UsersModule { }
