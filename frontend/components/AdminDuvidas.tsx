"use client";

import { useEffect, useState } from "react";

import {
  collection, query, where, orderBy, limit, onSnapshot,
  startAfter, getDocs, updateDoc, deleteDoc, doc, serverTimestamp, getDoc,
  type DocumentData, type QueryDocumentSnapshot
} from "firebase/firestore";

import { db } from "@/src/firebase/firebase";

import { getAuth } from "firebase/auth";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


type Status = "aberto" | "em_andamento" | "encerrado";

type DuvidaItem = {
  id: string;
  subject: string;
  status: Status;
  name?: string;
  email?: string;
  message?: string;
  createdAt?: any;
  answer?: string;
  answeredAt?: any;
  answeredBy?: string;
  answeredByName?: string;
};

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

/** Helpers */
const isValidStatus = (s: any): s is Status =>
  s === "aberto" || s === "em_andamento" || s === "encerrado";

const toDateSafe = (ts: any): string => {
  if (!ts) return "";
  if (typeof ts.toDate === "function") return ts.toDate().toLocaleString();
  if (typeof ts.seconds === "number") return new Date(ts.seconds * 1000).toLocaleString();
  return "";
};

const mapDoc = (d: QueryDocumentSnapshot<DocumentData>): DuvidaItem => {
  const data = d.data() as any;
  return {
    id: d.id,
    subject: data.subject ?? "",
    status: isValidStatus(data.status) ? data.status : "aberto",
    name: data.name ?? "",
    email: data.email ?? "",
    message: data.message ?? "",
    answer: data.answer ?? "",
    createdAt: data.createdAt,
    answeredAt: data.answeredAt,
    answeredBy: data.answeredBy ?? "",
    answeredByName: data.answeredByName ?? "",
  };
};

async function resolveCurrentUserNameFromUsers(): Promise<string> {
  const u = getAuth().currentUser;
  if (!u) return "Administrador";

  try {
    const snap = await getDoc(doc(db, "users", u.uid));
    if (snap.exists()) {
      const data = snap.data() as any;
      const name = (data?.name || data?.displayName || "").toString().trim();
      if (name) return name;
    }
  } catch {}

  if (u.displayName?.trim()) return u.displayName.trim();
  if (u.email) return u.email.split("@")[0];
  return "Administrador";
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

  const PAGE_SIZE = 20;
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // carregar lista
  useEffect(() => {
    const base = collection(db, "tiraDuvidas");
    const constraints: any[] = [];
    if (statusFilter) constraints.push(where("status", "==", statusFilter));
    constraints.push(orderBy("createdAt", "desc"), limit(PAGE_SIZE));

    const q = query(base, ...constraints);
    const unsub = onSnapshot(
      q,
      (snap) => {
        setItems(snap.docs.map(mapDoc)); // ← mapeamento explícito
        setCursor(snap.docs[snap.docs.length - 1] || null);
        setHasMore(snap.size === PAGE_SIZE);
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
    if (!cursor || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const base = collection(db, "tiraDuvidas");
      const constraints: any[] = [];
      if (statusFilter) constraints.push(where("status", "==", statusFilter));
      constraints.push(orderBy("createdAt", "desc"), startAfter(cursor), limit(PAGE_SIZE));
      const snap = await getDocs(query(base, ...constraints));

      const more = snap.docs.map(mapDoc); // ← mapeamento explícito
      setItems((prev) => [...prev, ...more]);

      setCursor(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.size === PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
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
      const answeredByName = await resolveCurrentUserNameFromUsers();

      await updateDoc(doc(db, "tiraDuvidas", id), {
        answer: text,
        status: "em_andamento",       // normalizado
        answeredBy: user.uid,
        answeredByName,
        answeredAt: serverTimestamp(),
      });
      setAnswerMap((prev) => ({ ...prev, [id]: "" })); // limpa campo
    } catch (e) {
      console.error("Erro ao responder:", e);
      alert("Não foi possível salvar a resposta.");
    } finally {
      setSavingId(null);
    }
  }

  // encerrar (botão minimalista)
  async function closeDoubt(id: string) {
    const user = auth.currentUser;
    if (!user) return;

    setSavingId(id);
    try {
      const answeredByName = await resolveCurrentUserNameFromUsers();
      await updateDoc(doc(db, "tiraDuvidas", id), {
        status: "encerrado",
        answeredBy: user.uid,
        answeredByName,
        answeredAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("Erro ao encerrar:", e);
      alert("Não foi possível encerrar a dúvida.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteDoubt(id: string) {
    setSavingId(id);
    try {
      await deleteDoc(doc(db, "tiraDuvidas", id));

      toast.success("Dúvida deletada com sucesso.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        hideProgressBar: false,
        pauseOnHover: true,
        progress: undefined,
      });
    } catch (e) {
      console.error("Erro ao deletar:", e);

      toast.error("Não foi possível deletar a dúvida.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        hideProgressBar: false,
        pauseOnHover: true,
        progress: undefined,
      });
    } finally {
      setSavingId(null);
    }
  }

  if (loading) return <p>Carregando…</p>;
  if (err) return <p className="text-red-600 text-sm">{err}</p>;

  // Segmented control
  const TABS: { value: "" | Status; label: string }[] = [
    { value: "", label: "Todos" },
    { value: "aberto", label: "Aberto" },
    { value: "em_andamento", label: "Em andamento" },
    { value: "encerrado", label: "Encerrado" },
  ];

  const dotClass = (s: "" | Status) =>
    s === "aberto"
      ? "bg-amber-500"
      : s === "em_andamento"
      ? "bg-indigo-500"
      : s === "encerrado"
      ? "bg-emerald-500"
      : "bg-gray-300";

  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 space-y-5">
        {/* Filtro de status */}
        <div className="w-full flex flex-col items-center justify-center">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Filtrar por status</h3>
            {statusFilter !== "" && (
              <button
                onClick={() => setStatusFilter("" as any)}
                className="text-xs text-gray-500 hover:text-gray-700 underline underline-offset-4"
              >
                Limpar
              </button>
            )}
          </div>

          <div
            role="tablist"
            aria-label="Filtro de status"
            className="inline-flex flex-wrap items-center justify-center gap-1 rounded-2xl bg-white px-1.5 py-1.5 shadow-sm ring-1 ring-gray-200"
          >
            {TABS.map((t) => {
              const active = statusFilter === t.value;
              return (
                <button
                  key={t.value || "all"}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(t.value as any)}
                  className={[
                    "group relative inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-medium transition",
                    active
                      ? "bg-gray-900 text-white shadow"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                  ].join(" ")}
                >
                  <span className={`h-2 w-2 rounded-full ${dotClass(t.value)}`} aria-hidden="true" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Cards */}
        <ul className="space-y-4">
          {items.map((d) => {
            const isOpen = openIds.has(d.id);
            const saving = savingId === d.id;
            const currentAnswer = answerMap[d.id] ?? "";
            const isClosed = d.status === "encerrado";

            return (
              <li key={d.id} className="mx-auto rounded-2xl border bg-white shadow-sm overflow-hidden">
                {/* Cabeçalho do card */}
                <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggle(d.id)}
                    aria-expanded={isOpen}
                    aria-controls={`duvida-${d.id}`}
                    className="flex-1 text-left flex items-center justify-between gap-2 hover:bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-violet-500" aria-hidden="true" />
                      <span className="font-extrabold text-black">{d.subject}</span>
                    </div>
                    <svg
                      className={`h-5 w-5 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
                      viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.25 8.27a.75.75 0 01-.02-1.06z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>

                  {/* Status + botão Encerrar */}
                  <div className="flex items-center gap-2">
                    <StatusBadge status={d.status} />
                  {!isClosed ? (
                        <button
                          title="Encerrar"
                          onClick={() => closeDoubt(d.id)}
                          disabled={saving}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-gray-300 text-gray-600 hover:text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50 transition disabled:opacity-60"
                          aria-label="Encerrar dúvida"
                        >
                          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0L3.296 9.52a1 1 0 111.414-1.414l3.027 3.027 6.536-6.536a1 1 0 011.431 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                  ) : (
                      <button
                        title="Deletar"
                        onClick={() => deleteDoubt(d.id)}
                        disabled={saving}
                        className="inline-flex items-center justify-center h-8 w-8 rounded-full border border-gray-300 text-red-600 hover:text-white hover:bg-red-600 hover:border-red-600 transition disabled:opacity-60 cursor-pointer"
                        aria-label="Deletar dúvida encerrada"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
                          <path d="M9 3h6a1 1 0 0 1 1 1v1h4v2h-1v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7H4V5h4V4a1 1 0 0 1 1-1Zm1 4H7v12h10V7h-3H10Zm1 2h2v8h-2V9Z"/>
                        </svg>
                      </button>
                  )}
                  </div>
                </div>

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
                          <div className="text-sm text-gray-900 font-semibold">Dúvida:</div>
                          <div className="text-xs text-gray-700 whitespace-pre-wrap">{d.message}</div>
                        </div>
                      )}

                      {d.answer && (
                        <div className="mt-3 rounded-lg bg-gray-50 border px-3 py-2">
                          <div className="text-sm text-gray-900 font-semibold">Resposta:</div>
                          <div className="text-xs text-gray-700 whitespace-pre-wrap">{d.answer}</div>
                        </div>
                      )}

                      {/* encerrado por */}
                      {isClosed && (
                        <div className="mt-2 text-xs text-gray-600">
                          Encerrado por <span className="font-medium">{d.answeredByName || "Administrador"}</span>
                          {d.answeredAt && <> em {toDateSafe(d.answeredAt)}</>}
                        </div>
                      )}

                      {/* responder */}
                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          placeholder={isClosed ? "Dúvida encerrada" : "Escreva sua resposta…"}
                          value={answerMap[d.id] ?? ""}
                          onChange={(e) => setAnswerMap((prev) => ({ ...prev, [d.id]: e.target.value }))}
                          disabled={saving || isClosed}
                          className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600/50 disabled:bg-gray-100"
                        />
                        <button
                          onClick={() => sendAnswer(d.id)}
                          disabled={saving || !(answerMap[d.id] ?? "").trim() || isClosed}
                          className="w-full sm:w-auto rounded-lg bg-[#AF1B1B] text-white px-3 py-2 text-sm font-medium hover:bg-red-700 disabled:opacity-80"
                        >
                          {saving && !isClosed ? "Enviando…" : "Responder"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        {/* Paginação */}
        <div className="flex justify-center py-6">
        {hasMore ? (
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="group inline-flex items-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium shadow-sm hover:-translate-y-px hover:shadow transition disabled:opacity-60"
            aria-live="polite"
          >
            {loadingMore ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25"/>
                  <path d="M21 12a9 9 0 0 1-9 9" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Carregando…
              </>
            ) : (
              <>
                Carregar mais
                <svg className="h-4 w-4 text-gray-500 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 1 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z"
                    clipRule="evenodd"
                  />
                </svg>
              </>
            )}
          </button>
        ) : (
          items.length >= 10 && (
            <div className="inline-flex items-center gap-3 rounded-full bg-gray-100 px-4 py-2 text-xs text-gray-600">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16ZM9 9V5h2v4H9Zm0 6v-2h2v2H9Z"/>
              </svg>
              Você chegou ao fim da lista
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="ml-1 underline underline-offset-4 hover:text-gray-800"
              >
                voltar ao topo
              </button>
            </div>
          )
        )}
        </div>
      </div>
    </div>
  );
}