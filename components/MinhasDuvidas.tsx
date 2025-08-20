// src/components/duvidas/MinhasDuvidas.tsx
"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/src/firebase/firebase";
import {
  collection, query, where, orderBy, onSnapshot, limit, DocumentData
} from "firebase/firestore";

type Doubt = {
  id: string;
  subject: string;
  status: string;
  message: string;
  createdAt?: any; // Timestamp | undefined
};

function toDateSafe(ts: any): Date | null {
  if (!ts) return null;
  if (typeof ts.toDate === "function") return ts.toDate(); // Firestore Timestamp
  if (typeof ts.seconds === "number") return new Date(ts.seconds * 1000);
  return null;
}

export function MinhasDuvidas() {
  const auth = getAuth();
  const [items, setItems] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    // espere o estado de auth estabilizar
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setItems([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "tiraDuvidas"),
        where("uid", "==", u.uid),       // necessário para bater nas regras
        orderBy("createdAt", "desc"),
        limit(20)
      );

      const unsub = onSnapshot(
        q,
        (snap) => {
          const rows = snap.docs.map((d) => {
            const data = d.data() as DocumentData;
            return {
                id: d.id,
                subject: data.subject ?? "",
                status: data.status ?? "aberto",
                message: data.message ?? "",
                createdAt: data.createdAt,
            } as Doubt;
          });
          setItems(rows);
          setErr(null);
          setLoading(false);
        },
        (error) => {
          console.error("onSnapshot(tiraDuvidas) error:", error);
          setErr(error?.message || "Erro ao carregar suas dúvidas.");
          setLoading(false);
        }
      );

      // limpar listener quando usuário muda
      return () => unsub();
    });

    return () => unsubAuth();
  }, [auth]);

  if (loading) return <p>Carregando…</p>;
  if (err) return <p className="text-red-600 text-sm">{err}</p>;
  if (!items.length) return <p>Você ainda não enviou dúvidas.</p>;

  return (
    <ul className="space-y-3">
      {items.map((d) => {
        const dt = toDateSafe(d.createdAt);
        return (
          <li key={d.id} className="rounded border p-3">
            <div className="flex justify-between">
                <div className="flex flex-col gap-1">
                    <strong className="bg-red-200">{d.subject}</strong>
                    <span className="text-sm text-gray-600">{d.message}</span>
                </div>
                <span className="text-xs uppercase">{d.status}</span>
            </div>
            <div className="text-xs text-gray-500">
              {dt ? dt.toLocaleString() : ""}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
