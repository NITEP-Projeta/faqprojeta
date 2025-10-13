/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseService {
    /**
     * O construtor está vazio porque a inicialização do Firebase é feita no
     * arquivo firebase.admin.ts, que é importado no app.module.ts
     */
    constructor() { }

    /**
     * Retorna a instância do Firebase Authentication
     */
    getAuth() {
        return admin.auth();
    }

    /**
     * Retorna a instância do Firestore
     */
    getFirestore() {
        return admin.firestore();
    }
}
}

        } else {
    this.app = getApp();
}
    }

auth() {
    return admin.auth();
}

firestore() {
    return admin.firestore();
}

