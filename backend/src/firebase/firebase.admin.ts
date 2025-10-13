/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// src/firebase/firebase.admin.ts
import * as admin from 'firebase-admin';
import { join } from 'path';

// Carregue o JSON de credenciais que você baixou do Console do Firebase
// (lembre-se de NÃO comitar esse JSON no Git)
const serviceAccount = require(join(__dirname, 'firebase-credentials.json'));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // Se você usar outras features, por ex. storage, adicione aqui:
    // storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});

export { admin };
