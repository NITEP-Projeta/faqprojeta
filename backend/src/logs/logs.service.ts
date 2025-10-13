/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../shared/firebase.service';

@Injectable()
export class LogsService {
    constructor(private readonly firebase: FirebaseService) { }

    async create(userId: string, action: string, metadata?: any) {
        const db = this.firebase.firestore(); // 🔹 NÃO getFirestore()
        const ref = db.collection('logs').doc();

        await ref.set({
            userId,
            action,
            metadata: metadata || {},
            createdAt: new Date(),
        });

        return { id: ref.id, userId, action };
    }
}
