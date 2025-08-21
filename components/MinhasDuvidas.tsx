// src/components/duvidas/MinhasDuvidas.tsx
"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "@/src/firebase/firebase";
import {
  collection, query, where, orderBy, onSnapshot, limit, DocumentData
} from "firebase/firestore";

type Status = "aberto" | "em_andamento" | "encerrado";

type Doubt = {
  id: string;
  subject: string;
  status?: Status;
  name?: string;
  email?: string;
  message: string;
  answer?: string;
  createdAt?: any;
  answeredAt?: any;
};

function toDateSafe(ts: any): string {
  if (!ts) return "";
  if (typeof ts.toDate === "function") return ts.toDate().toLocaleString();
  if (typeof ts.seconds === "number") return new Date(ts.seconds * 1000).toLocaleString();
  return "";
}

function coerceStatus(s: any): Status {
  return s === "aberto" || s === "em_andamento" || s === "encerrado" ? s : "aberto";
}

function StatusBadge({ status }: { status?: Status }) {
  const s = coerceStatus(status);
  const map: Record<Status, string> = {
    aberto: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
    em_andamento: "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200",
    encerrado: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[s]}`}>
      {s.replace("_", " ")}
    </span>
  );
}

export function MinhasDuvidas() {
  const auth = getAuth();
  const [items, setItems] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set()); // controla cards abertos

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      if (!u) {
        setItems([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, "tiraDuvidas"),
        where("uid", "==", u.uid),       // bate com as regras
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
              status: coerceStatus(data.status),
              message: data.message ?? "",
              name: data.name ?? "",
              email: data.email ?? "",
              answer: data.answer ?? "",
              createdAt: data.createdAt,
              answeredAt: data.answeredAt,
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

      return () => unsub();
    });

    return () => unsubAuth();
  }, [auth]);

  function toggle(id: string) {
    setOpenIds((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  }

  if (loading) return <p>Carregando…</p>;
  if (err) return <p className="text-red-600 text-sm">{err}</p>;
  if (!items.length) return <p>Você ainda não enviou dúvidas.</p>;

  return (
    <ul className="space-y-3">
      {items.map((d) => {
        const isOpen = openIds.has(d.id);
        return (
          <li key={d.id} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            {/* Cabeçalho clicável (título + status + data) */}
            <button
              type="button"
              onClick={() => toggle(d.id)}
              aria-expanded={isOpen}
              aria-controls={`duvida-${d.id}`}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-gray-300" />
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{d.subject}</span>
                  <span className="text-xs text-gray-500">{toDateSafe(d.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={d.status as Status} />
                <svg
                  className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                >
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                </svg>
              </div>
            </button>

            {/* Conteúdo expandido (mensagem do usuário + resposta do ADM) */}
            <div
              id={`duvida-${d.id}`}
              className={`grid transition-all duration-200 ease-out ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 pt-1 text-sm text-gray-700">
                  <div className="text-xs text-gray-500">
                    <div>{d.name}</div>
                    <p>{d.email}</p>
                  </div>

                  <div>
                    <span className="text-xs  text-gray-500">Sua mensagem:</span>
                    <span className="mt-1 whitespace-pre-wrap">{d.message}</span>
                  </div>

                  {/* Resposta do ADM */}
                  <div className="mt-4">
                    <div className="text-xs text-gray-500">Resposta do suporte:</div>
                    {d.answer ? (
                      <div className="mt-1 rounded-lg bg-gray-50 border px-3 py-2">
                        <div className="text-sm text-gray-800 whitespace-pre-wrap">{d.answer}</div>
                        {d.answeredAt && (
                          <div className="mt-1 text-xs text-gray-500">
                            Respondido em: {toDateSafe(d.answeredAt)}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-1 text-sm text-gray-500">
                        Ainda sem resposta. Aguarde, por favor. 🙂
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
