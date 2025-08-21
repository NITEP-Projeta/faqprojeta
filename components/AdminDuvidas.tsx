// src/components/duvidas/AdminDuvidas.tsx
"use client";

import { useEffect, useState } from "react";

import {
  collection, query, where, orderBy, limit, onSnapshot,
  startAfter, getDocs, updateDoc, doc, serverTimestamp
} from "firebase/firestore";

import { db } from "@/src/firebase/firebase";

import { getAuth } from "firebase/auth";

type Status = "aberto" | "em_andamento" | "encerrado";

type DuvidaItem = {
  id: string;
  subject: string;
  status: Status;
  name?: string
  email?: string;
  message?: string;
  createdAt?: any;   // Firestore Timestamp
  answer?: string;   // resposta atual (se já houver)
};

function toDateSafe(ts: any): string {
  if (!ts) return "";
  if (typeof ts.toDate === "function") return ts.toDate().toLocaleString();
  if (typeof ts.seconds === "number") return new Date(ts.seconds * 1000).toLocaleString();
  return "";
}

function StatusBadge({ status }: { status: Status }) {
  const map: Record<Status, string> = {
    aberto: "bg-amber-100 text-amber-800 ring-1 ring-amber-200",
    em_andamento: "bg-indigo-100 text-indigo-800 ring-1 ring-indigo-200",
    encerrado: "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[status]}`}>
      {status.replace("_", " ")}
    </span>
  );
}

export function AdminDuvidas() {
  const auth = getAuth();

  const [statusFilter, setStatusFilter] = useState<"" | Status>("");
  const [items, setItems] = useState<DuvidaItem[]>([]);
  const [cursor, setCursor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  // carregar lista
  useEffect(() => {
    const base = collection(db, "tiraDuvidas");
    const constraints: any[] = [];
    if (statusFilter) constraints.push(where("status", "==", statusFilter));
    constraints.push(orderBy("createdAt", "desc"), limit(20));

    const q = query(base, ...constraints);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) })));
        setCursor(snap.docs[snap.docs.length - 1] || null);
        setErr(null);
        setLoading(false);
      },
      (error) => {
        console.error("onSnapshot(admin/duvidas) error:", error);
        setErr(error.message || "Erro ao carregar dúvidas.");
        setLoading(false);
      }
    );

    return () => unsub();
  }, [statusFilter]);

  async function loadMore() {
    if (!cursor) return;
    const base = collection(db, "tiraDuvidas");
    const constraints: any[] = [];
    if (statusFilter) constraints.push(where("status", "==", statusFilter));
    constraints.push(orderBy("createdAt", "desc"), startAfter(cursor), limit(20));
    const snap = await getDocs(query(base, ...constraints));
    setItems((prev) => [...prev, ...snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }))]);
    setCursor(snap.docs[snap.docs.length - 1] || null);
  }

  function toggle(id: string) {
    setOpenIds((prev) => {
      const copy = new Set(prev);
      copy.has(id) ? copy.delete(id) : copy.add(id);
      return copy;
    });
  }

  async function sendAnswer(id: string) {
    const user = auth.currentUser;
    const text = (answerMap[id] ?? "").trim();
    if (!user || !text) return;

    setSavingId(id);
    try {
      await updateDoc(doc(db, "tiraDuvidas", id), {
        answer: text,
        status: "Em Andamento",
        answeredBy: user.uid,
        answeredAt: serverTimestamp(),
      });

      // limpa o campo após salvar
      setAnswerMap((prev) => ({ ...prev, [id]: "" }));
    } catch (e) {
      console.error("Erro ao responder:", e);
      alert("Não foi possível salvar a resposta.");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <p>Carregando…</p>;
  if (err) return <p className="text-red-600 text-sm">{err}</p>;

  return (
    <div className="space-y-4">
      {/* Filtro de status */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-gray-600">Status:</label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="border rounded px-2 py-1 text-sm"
        >
          <option value="">Todos</option>
          <option value="aberto">Aberto</option>
          <option value="em_andamento">Em andamento</option>
          <option value="encerrado">Encerrado</option>
        </select>
      </div>

      {/* Cards colapsáveis */}
      <ul className="space-y-3">
        {items.map((d) => {
          const isOpen = openIds.has(d.id);
          const saving = savingId === d.id;
          const currentAnswer = answerMap[d.id] ?? "";

          return (
            <li key={d.id} className="rounded-2xl border bg-white shadow-sm overflow-hidden">
              {/* Cabeçalho do card */}
              <button
                type="button"
                onClick={() => toggle(d.id)}
                aria-expanded={isOpen}
                aria-controls={`duvida-${d.id}`}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
                  <div className="flex flex-col">
                    <span className="font-extrabold text-black">{d.subject}</span>
                    <span className="text-xs text-gray-500">{toDateSafe(d.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={d.status} />
                  <svg
                    className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                  >
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z" clipRule="evenodd" />
                  </svg>
                </div>
              </button>

              {/* Conteúdo expandido */}
              <div
                id={`duvida-${d.id}`}
                className={`grid transition-all duration-200 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4 pt-1 text-sm text-gray-700">

                    <div className="flex flex-wrap items-center text-sm gap-1">
                      <span className="font-bold text-black">Nome:</span>
                      <span className="select-all text-gray-700 font-medium">{d.name}</span>
                    </div>

                    <div className="flex flex-wrap items-center text-sm gap-1">
                      <span className="font-bold text-black">E-mail:</span>
                      <span className="select-all text-gray-700 font-medium">{d.email}</span>
                    </div>

                    {d.message && (
                      <div className="mt-3 rounded-lg bg-gray-50 border px-3 py-2">
                        <div className="text-xs text-gray-900 font-semibold">Dúvida:</div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">{d.message}</div>
                      </div>
                    )}

                    {/* Se já houver resposta gravada, mostre */}
                    {d.answer && (
                      <div className="mt-3 rounded-lg bg-gray-50 border px-3 py-2">
                        <div className="text-xs text-gray-900 font-semibold">Resposta:</div>
                        <div className="text-sm text-gray-700 whitespace-pre-wrap">{d.answer}</div>
                      </div>
                    )}

                    {/* --- NOVO: responder --- */}
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        placeholder="Escreva sua resposta…"
                        value={currentAnswer}
                        onChange={(e) =>
                          setAnswerMap((prev) => ({ ...prev, [d.id]: e.target.value }))
                        }
                        disabled={saving || d.status === "encerrado"}
                        className="flex-1 rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/50 disabled:bg-gray-100"
                      />
                      <button
                        onClick={() => sendAnswer(d.id)}
                        disabled={saving || !currentAnswer.trim() || d.status === "encerrado"}
                        className="rounded-lg bg-[#AF1B1B] text-white px-3 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-80 cursor-pointer"
                      >
                        {saving ? "Enviando…" : "Responder"}
                      </button>
                    </div>
                    {/* ---------------------- */}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="flex justify-center">
        <button
          onClick={loadMore}
          className="rounded-lg border px-4 py-1.5 text-sm hover:bg-gray-50"
        >
          Carregar mais
        </button>
      </div>
    </div>
  );
}
