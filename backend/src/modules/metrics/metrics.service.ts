import { Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/firebase/firebase.service';

@Injectable()
export class MetricsService {
  constructor(private readonly firebase: FirebaseService) { }

  async getDailyActive(days: number) {
    const db = this.firebase.firestore(); // 🔹 certo
    const snapshot = await db.collection('metrics')
      .where('type', '==', 'daily-active')
      .orderBy('date', 'desc')
      .limit(days)
      .get();

    return snapshot.docs.map(d => d.data());
  }

  async getMonthlyActive(months: number) {
    const db = this.firebase.firestore(); // 🔹 certo
    const snapshot = await db.collection('metrics')
      .where('type', '==', 'monthly-active')
      .orderBy('month', 'desc')
      .limit(months)
      .get();

    return snapshot.docs.map(d => d.data());
  }
}
