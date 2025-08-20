import { Injectable } from '@nestjs/common';
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

@Injectable()
export class FirebaseService {
    private app;

    constructor() {
        if (!getApps().length) {
            this.app = initializeApp({
                credential: undefined, // usa credenciais padrão (GOOGLE_APPLICATION_CREDENTIALS)
            });
        } else {
            this.app = getApp();
        }
    }

    auth() {
        return getAuth(this.app); // 🔹 use auth()
    }

    firestore() {
        return getFirestore(this.app); // 🔹 use firestore()
    }
}
