/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../shared/firebase.service';

export interface Metric {
  date?: string;
  month?: string;
  count: number;
  [key: string]: any;
}

@Injectable()
export class MetricsService {
  constructor(private readonly firebase: FirebaseService) { }

  private get db() {
    return this.firebase.firestore();
  }

  // Usuários ativos por dia
  async getDailyActive(days: number = 30): Promise<Metric[]> {
    const snapshot = await this.db
      .collection('metrics')
      .where('type', '==', 'daily-active')
      .orderBy('date', 'desc')
      .limit(days)
      .get();

    return snapshot.docs.map((d) => d.data() as Metric);
  }

  // Usuários ativos por mês
  async getMonthlyActive(months: number = 12): Promise<Metric[]> {
    const snapshot = await this.db
      .collection('metrics')
      .where('type', '==', 'monthly-active')
      .orderBy('month', 'desc')
      .limit(months)
      .get();

    return snapshot.docs.map((d) => d.data() as Metric);
  }

  // Taxa de engajamento (DAU/MAU)
  async getEngagement() {
    const daily = await this.getDailyActive(30);
    const monthly = await this.getMonthlyActive(1);

    if (!daily.length || !monthly.length) {
      return { ratio: 0, avgDAU: 0, mau: 0 };
    }

    const avgDAU =
      daily.reduce((acc, d) => acc + (d.count ?? 0), 0) / daily.length;
    const mau = monthly[0].count ?? 1;

    return {
      ratio: Number(((avgDAU / mau) * 100).toFixed(2)), // %
      avgDAU,
      mau,
    };
  }

  // Tempo médio de sessão (em minutos)
  async getAvgSessionTime() {
    const snapshot = await this.db.collection('sessionMetrics').get();
    if (snapshot.empty) return { avg: 0 };

    const total = snapshot.docs.reduce(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      (acc, d) => acc + (d.data().duration ?? 0),
      0,
    );
    return { avg: total / snapshot.size };
  }

  // Usuários ativos em tempo real (últimos 5min)
  async getRealtimeActive() {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const snapshot = await this.db
      .collection('userSessions')
      .where('lastSeen', '>=', fiveMinAgo)
      .get();

    return { activeNow: snapshot.size };
  }

  // FAQs mais acessados
  async getTopFaqs(limit: number = 5) {
    const snapshot = await this.db
      .collection('faqMetrics')
      .orderBy('views', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((d) => d.data());
  }

  // Comparativo de usuários por filial
  async getUsersByBranch() {
    const snapshot = await this.db.collection('branchMetrics').get();
    return snapshot.docs.map((d) => d.data());
  }
}
