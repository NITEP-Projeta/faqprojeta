/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
    private ensureInitialized() {
        if (admin.apps.length === 0) {
            throw new Error('Firebase app não inicializado');
        }
    }

    firestore() {
        this.ensureInitialized();
        return admin.firestore();
    }

    auth() {
        this.ensureInitialized();
        return admin.auth();
    }

    database() {
        this.ensureInitialized();
        return admin.database();
    }
}
