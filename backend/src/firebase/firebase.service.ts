/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
    private app: App;

    constructor() {
        if (!getApps().length) {
            const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
            if (!serviceAccountJson) {
                throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not set in .env');
            }

            const serviceAccount = JSON.parse(serviceAccountJson);

            // Corrige a quebra de linha da chave privada
            serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

            this.app = initializeApp({
                credential: admin.credential.cert(serviceAccount),
                projectId: serviceAccount.project_id,
            });
        } else {
            this.app = getApp();
        }
    }

    auth() {
        return getAuth(this.app);
    }

    firestore() {
        return getFirestore(this.app);
    }
}
