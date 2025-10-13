import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
// Teste de commit
function initializeFirebase() {
  if (admin.apps.length > 0) return;

  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const databaseURL = process.env.FIREBASE_DATABASE_URL;

  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY ausente');
  }

  const parsed = JSON.parse(serviceAccountJson);
  if (parsed.private_key) {
    parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
  }

  admin.initializeApp({
    credential: admin.credential.cert(parsed),
    databaseURL,
  });

  console.info('[Main] Firebase inicializado globalmente');
}

async function bootstrap() {
  initializeFirebase();
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(3001);
}

bootstrap();
