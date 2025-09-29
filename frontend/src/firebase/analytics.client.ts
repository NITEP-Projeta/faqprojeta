"use client";

import { app } from "./firebase";
import {
  getAnalytics,
  isSupported,
  logEvent,
  setUserId,
  setUserProperties,
  type Analytics,
} from "firebase/analytics";

let analyticsInstance: Analytics | null = null;
let initPromise: Promise<Analytics | null> | null = null;
const eventQueue: Array<{ name: string; params?: Record<string, any> }> = [];

function isDevOrLocalhost() {
  if (typeof window === "undefined") return false;
  return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
}

export async function initAnalytics(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null; // evita SSR

  if (analyticsInstance) return analyticsInstance;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const ok = await isSupported().catch(() => false);
    if (!ok) return null;

    try {
      const a = getAnalytics(app);
      analyticsInstance = a;

      // Drena a fila de eventos pendentes
      while (eventQueue.length) {
        const { name, params } = eventQueue.shift()!;
        try {
          logEvent(a, name, params);
        } catch {}
      }
      return a;
    } catch {
      // Ex.: cookies indisponíveis, ambientes não suportados etc.
      return null;
    }
  })();

  return initPromise;
}

/** Enfileira e envia um evento com segurança */
export async function logAnalyticsEvent(
  event: string,
  params?: Record<string, any>
) {
  const baseParams = {
    ...(params || {}),
    ...(isDevOrLocalhost() ? { debug_mode: true } : {}),
  };

  if (analyticsInstance) {
    try {
      logEvent(analyticsInstance, event, baseParams);
    } catch {}
    return;
  }

  // ainda não inicializado → coloca na fila
  eventQueue.push({ name: event, params: baseParams });
  await initAnalytics(); // tenta inicializar
}

/** Define o userId e propriedades do usuário (chamar após login) */
export async function setAnalyticsUser(user: { uid: string; email?: string; role?: string }) {
  const a = await initAnalytics();
  if (!a) return;

  try {
    setUserId(a, user.uid);
    setUserProperties(a, {
      email: user.email ?? "",
      role: user.role ?? "user",
    });
  } catch {}
}

/** Helper para page_view (chame no mount e a cada mudança de rota) */
export async function logPageView() {
  if (typeof window === "undefined") return;
  await logAnalyticsEvent("page_view", {
    page_location: window.location.href,
    page_path: window.location.pathname,
    page_title: document?.title,
  });
}

/** (Opcional) Se usar Consent Mode, libere consentimento antes de enviar eventos */
export function grantAnalyticsConsent() {
  if (typeof window === "undefined") return;
  // @ts-ignore
  window.gtag?.("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
  });
}
