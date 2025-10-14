import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';

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
    origin: [
      process.env.FRONTEND_URL || 'https://faqprojeta.vercel.app',
      'http://localhost:3000',
    ],
    methods: 'GET,POST,PUT,DELETE,PATCH,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization',
    credentials: true,
  });

  // 🚀 Porta dinâmica para Render (OU 3001 localmente)
  const port = process.env.PORT || 3001;

  await app.listen(port);
  console.log(`🚀 Servidor Nest rodando na porta ${port}`);
}

bootstrap();
