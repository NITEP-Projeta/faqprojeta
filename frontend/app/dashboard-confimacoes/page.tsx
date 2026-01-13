"use client";

import { useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { auth, db } from "@/src/firebase/firebase";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

type Confirmacao = {
  id: string;
  uid: string;
  nome: string;
  email: string;
  documentoSlug: string;
  pagina?: string;
  acessadoEm?: any; // Timestamp
  pagePath?: string;
  userAgent?: string | null;
};

// ✅ Mapeie slug -> nome amigável (ajuste conforme seus PDFs)
const DOCUMENTOS: Record<string, string> = {
  "regimento-interno": "Regimento Interno",
  // adicione outros aqui
  // "politica-sgq": "Política do SGQ",
};

export default function DashboardConfirmacoesPage() {
  const [loading, setLoading] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);

  const [confirmacoes, setConfirmacoes] = useState<Confirmacao[]>([]);
  const [search, setSearch] = useState("");
  const [docFiltro, setDocFiltro] = useState<string>("todos");

  // ✅ Checa admin via users/{uid}.isAdmin
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      setIsAdminUser(false);

      try {
        if (!user) {
          setLoading(false);
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);

        const admin = snap.exists() ? (snap.data() as any).isAdmin === true : false;
        setIsAdminUser(admin);
      } catch (e) {
        console.error("Erro ao verificar admin:", e);
        setIsAdminUser(false);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, []);

  // ✅ Escuta confirmações (apenas admin deve acessar)
  useEffect(() => {
    if (!isAdminUser) return;

    const q = query(
      collection(db, "confirmacoesLeitura"),
      orderBy("acessadoEm", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const lista: Confirmacao[] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as any),
        }));
        setConfirmacoes(lista);
      },
      (err) => {
        console.error("Erro ao escutar confirmacoesLeitura:", err);
      }
    );

    return () => unsub();
  }, [isAdminUser]);

  const documentosUnicos = useMemo(() => {
    const set = new Set<string>();
    confirmacoes.forEach((c) => c.documentoSlug && set.add(c.documentoSlug));
    return Array.from(set).sort();
  }, [confirmacoes]);

  const listaFiltrada = useMemo(() => {
    const s = search.trim().toLowerCase();

    return confirmacoes.filter((c) => {
      const docOk = docFiltro === "todos" ? true : c.documentoSlug === docFiltro;

      if (!docOk) return false;
      if (!s) return true;

      const nomeDoc = DOCUMENTOS[c.documentoSlug] ?? c.documentoSlug;

      return (
        (c.nome ?? "").toLowerCase().includes(s) ||
        (c.email ?? "").toLowerCase().includes(s) ||
        (c.documentoSlug ?? "").toLowerCase().includes(s) ||
        nomeDoc.toLowerCase().includes(s) ||
        (c.pagina ?? "").toLowerCase().includes(s)
      );
    });
  }, [confirmacoes, search, docFiltro]);

  const total = confirmacoes.length;
  const totalUsuarios = useMemo(() => {
    const set = new Set<string>();
    confirmacoes.forEach((c) => c.uid && set.add(c.uid));
    return set.size;
  }, [confirmacoes]);

  const totalDocs = useMemo(() => {
    const set = new Set<string>();
    confirmacoes.forEach((c) => c.documentoSlug && set.add(c.documentoSlug));
    return set.size;
  }, [confirmacoes]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen from-white to-gray-50">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Cabeçalho */}
          <header className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Dashboard • Confirmações de Leitura
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Visualize quem confirmou a leitura e quais documentos foram confirmados
            </p>
          </header>

          {/* Estado de carregamento / permissão */}
          {loading ? (
            <div className="mt-10 rounded-2xl bg-white border border-gray-200 shadow-sm p-6 text-center text-sm text-gray-600">
              Carregando...
            </div>
          ) : !isAdminUser ? (
            <div className="mt-10 rounded-2xl bg-white border border-gray-200 shadow-sm p-6">
              <p className="text-sm text-gray-700">
                Você não tem permissão para acessar este painel.
              </p>
            </div>
          ) : (
            <>
              {/* KPIs */}
              <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
                  <p className="text-sm text-gray-600">Confirmações</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{total}</p>
                </div>

                <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
                  <p className="text-sm text-gray-600">Usuários únicos</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{totalUsuarios}</p>
                </div>

                <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5">
                  <p className="text-sm text-gray-600">Documentos</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{totalDocs}</p>
                </div>
              </section>

              {/* Filtros */}
              <section className="mt-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="px-5 py-5">
                  <h2 className="text-base font-semibold text-gray-900">
                    Filtros
                  </h2>

                  <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Busca */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-900">
                        Buscar
                      </label>
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Nome, e-mail, documento, página..."
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B0D0D]/50"
                      />
                    </div>

                    {/* Documento */}
                    <div className="space-y-1.5">
                      <label className="block text-sm font-medium text-gray-900">
                        Documento
                      </label>
                      <select
                        value={docFiltro}
                        onChange={(e) => setDocFiltro(e.target.value)}
                        className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-[#8B0D0D]/50"
                      >
                        <option value="todos">Todos</option>
                        {documentosUnicos.map((slug) => (
                          <option key={slug} value={slug}>
                            {DOCUMENTOS[slug] ? `${DOCUMENTOS[slug]} (${slug})` : slug}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Lista */}
              <section className="mt-6 rounded-2xl bg-white border border-gray-200 shadow-sm">
                <div className="px-5 py-5">
                  <h2 className="text-base font-semibold text-gray-900 mb-3">
                    Confirmações
                  </h2>

                  {listaFiltrada.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      Nenhuma confirmação encontrada.
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {listaFiltrada.map((item) => {
                        const nomeDoc = DOCUMENTOS[item.documentoSlug] ?? item.documentoSlug;

                        return (
                          <div
                            key={item.id}
                            className="rounded-xl border border-gray-100 bg-white shadow-sm p-5"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-base font-semibold text-gray-900">
                                  {nomeDoc}
                                </h3>

                                <p className="text-sm text-gray-500 mt-0.5">
                                  <span className="font-semibold text-gray-800">
                                    Documento:
                                  </span>{" "}
                                  {item.documentoSlug}
                                  {item.pagina ? (
                                    <>
                                      {" "}•{" "}
                                      <span className="font-semibold text-gray-800">
                                        Página:
                                      </span>{" "}
                                      {item.pagina}
                                    </>
                                  ) : null}
                                </p>

                                <p className="text-sm text-gray-500 mt-2">
                                  <span className="font-semibold text-gray-800">
                                    Nome:
                                  </span>{" "}
                                  {item.nome || "—"} <br />
                                  <span className="font-semibold text-gray-800">
                                    E-mail:
                                  </span>{" "}
                                  {item.email || "—"}
                                </p>
                              </div>

                              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                                Confirmado
                              </span>
                            </div>

                            <p className="text-xs text-gray-400 mt-3">
                              Confirmado em{" "}
                              {item.acessadoEm?.toDate
                                ? item.acessadoEm.toDate().toLocaleString("pt-BR")
                                : "—"}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}