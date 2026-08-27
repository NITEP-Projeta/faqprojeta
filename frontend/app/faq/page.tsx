"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { db, auth } from "@/src/firebase/firebase";

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  Search,
  Send,
  MessageCircleQuestion,
  Clock3,
  CircleCheckBig,
  MessagesSquare,
  ChevronDown,
  ChevronUp,
  Inbox,
  Mail,
  User,
  FileQuestion,
  Loader2,
  Headphones,
} from "lucide-react";

type DuvidaStatus =
  | "aberto"
  | "em_analise"
  | "em_andamento"
  | "respondido"
  | "fechado";

type FirestoreDate = {
  toDate?: () => Date;
};

type Duvida = {
  id: string;
  uid?: string;
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  status?: DuvidaStatus | string;
  answer?: string;
  answeredByName?: string;
  answeredAt?: FirestoreDate;
  createdAt?: FirestoreDate;
};

type StatusFilter =
  | "todos"
  | "aberto"
  | "em_analise"
  | "respondido"
  | "fechado";

export default function TiraDuvidasPage() {
  const [loading, setLoading] = useState(false);
  const [duvidas, setDuvidas] = useState<Duvida[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("todos");

  /*
   * ============================================================
   * AUTENTICAÇÃO
   * ============================================================
   */

  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserEmail(user.email);
        setUserUid(user.uid);
      } else {
        setUserEmail(null);
        setUserUid(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  /*
   * ============================================================
   * DÚVIDAS DO USUÁRIO
   * ============================================================
   */

  useEffect(() => {
    if (!userUid) return;

    const q = query(
      collection(db, "tiraDuvidas"),
      where("uid", "==", userUid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const lista: Duvida[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDuvidas(lista);
      },
      (error) => {
        console.error("Erro ao carregar dúvidas:", error);

        toast.error(
          "Não foi possível carregar suas dúvidas."
        );
      }
    );

    return () => unsubscribe();
  }, [userUid]);

  /*
   * ============================================================
   * ENVIO DE NOVA DÚVIDA
   * ============================================================
   */

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    const formElement = e.currentTarget;

    try {
      const user = auth.currentUser;

      if (!user) {
        throw new Error("Usuário não autenticado.");
      }

      const form = new FormData(formElement);

      const name = String(form.get("name") || "").trim();
      const subject = String(
        form.get("subject") || ""
      ).trim();
      const message = String(
        form.get("message") || ""
      ).trim();

      if (!name || !subject || !message) {
        toast.warning(
          "Preencha todos os campos obrigatórios."
        );
        return;
      }

      const payload = {
        uid: user.uid,
        name,
        email: user.email,
        subject,
        message,
        status: "aberto",
        createdAt: serverTimestamp(),
      };

      await addDoc(
        collection(db, "tiraDuvidas"),
        payload
      );

      toast.success(
        "Dúvida enviada com sucesso!"
      );

      formElement.reset();
    } catch (err) {
      console.error(err);

      toast.error(
        "Erro ao enviar a dúvida. Verifique suas permissões."
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ============================================================
   * EXPANSÃO DE RESPOSTAS
   * ============================================================
   */

  function toggleExpand(id: string) {
    setExpandedId((prev) =>
      prev === id ? null : id
    );
  }

  /*
   * ============================================================
   * FORMATAÇÃO
   * ============================================================
   */

  function formatDate(
    timestamp?: FirestoreDate
  ) {
    if (!timestamp?.toDate) {
      return "—";
    }

    try {
      return timestamp
        .toDate()
        .toLocaleString("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
    } catch {
      return "—";
    }
  }

  /*
   * ============================================================
   * INDICADORES
   * ============================================================
   */

  const indicadores = useMemo(() => {
    const total = duvidas.length;

    const abertas = duvidas.filter(
      (item) => item.status === "aberto"
    ).length;

    const andamento = duvidas.filter(
      (item) =>
        item.status === "em_analise" ||
        item.status === "em_andamento"
    ).length;

    const respondidas = duvidas.filter(
      (item) =>
        item.status === "respondido" ||
        Boolean(item.answer)
    ).length;

    return {
      total,
      abertas,
      andamento,
      respondidas,
    };
  }, [duvidas]);

  /*
   * ============================================================
   * FILTRO E BUSCA
   * ============================================================
   */

  const duvidasFiltradas = useMemo(() => {
    const termo = searchTerm
      .trim()
      .toLowerCase();

    return duvidas.filter((item) => {
      const correspondeBusca =
        !termo ||
        item.subject
          ?.toLowerCase()
          .includes(termo) ||
        item.message
          ?.toLowerCase()
          .includes(termo) ||
        item.answer
          ?.toLowerCase()
          .includes(termo) ||
        item.name
          ?.toLowerCase()
          .includes(termo);

      let correspondeStatus = true;

      if (statusFilter === "aberto") {
        correspondeStatus =
          item.status === "aberto";
      }

      if (statusFilter === "em_analise") {
        correspondeStatus =
          item.status === "em_analise" ||
          item.status === "em_andamento";
      }

      if (statusFilter === "respondido") {
        correspondeStatus =
          item.status === "respondido" ||
          Boolean(item.answer);
      }

      if (statusFilter === "fechado") {
        correspondeStatus =
          item.status === "fechado";
      }

      return (
        correspondeBusca &&
        correspondeStatus
      );
    });
  }, [
    duvidas,
    searchTerm,
    statusFilter,
  ]);

  /*
   * ============================================================
   * STATUS
   * ============================================================
   */

  function getStatusConfig(
    status?: string
  ) {
    switch (status) {
      case "respondido":
        return {
          label: "Respondido",
          className:
            "bg-emerald-50 text-emerald-700 border-emerald-200",
        };

      case "em_analise":
        return {
          label: "Em análise",
          className:
            "bg-blue-50 text-blue-700 border-blue-200",
        };

      case "em_andamento":
        return {
          label: "Em andamento",
          className:
            "bg-blue-50 text-blue-700 border-blue-200",
        };

      case "fechado":
        return {
          label: "Fechado",
          className:
            "bg-gray-100 text-gray-600 border-gray-200",
        };

      default:
        return {
          label: "Aberto",
          className:
            "bg-amber-50 text-amber-700 border-amber-200",
        };
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F7F7F8]">
        {/*
         * ======================================================
         * HERO / CABEÇALHO
         * ======================================================
         */}

        <section className="border-b border-gray-200 bg-white">
          <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#AF1B1B]/10">
                    <MessageCircleQuestion className="h-5 w-5 text-[#AF1B1B]" />
                  </div>

                  <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#AF1B1B]">
                    Central de Ajuda
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-[#171717] sm:text-4xl lg:text-5xl">
                  Como podemos ajudar?
                </h1>

                <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
                  Envie suas dúvidas, acompanhe o
                  andamento das solicitações e consulte
                  as respostas fornecidas pela equipe
                  responsável.
                </p>
              </div>

              <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-[#FAFAFA] px-4 py-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white shadow-sm">
                  <Headphones className="h-5 w-5 text-[#AF1B1B]" />
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                    Canal Interno
                  </p>

                  <p className="text-sm font-semibold text-gray-800">
                    Suporte Projeta
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/*
         * ======================================================
         * CONTEÚDO
         * ======================================================
         */}

        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/*
           * ====================================================
           * INDICADORES
           * ====================================================
           */}

          <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                  <MessagesSquare className="h-5 w-5 text-gray-700" />
                </div>

                <span className="text-2xl font-bold text-gray-900">
                  {indicadores.total}
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold text-gray-900">
                Total de dúvidas
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Solicitações registradas
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50">
                  <Clock3 className="h-5 w-5 text-amber-600" />
                </div>

                <span className="text-2xl font-bold text-gray-900">
                  {indicadores.abertas}
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold text-gray-900">
                Abertas
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Aguardando atendimento
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                  <Loader2 className="h-5 w-5 text-blue-600" />
                </div>

                <span className="text-2xl font-bold text-gray-900">
                  {indicadores.andamento}
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold text-gray-900">
                Em análise
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Sendo avaliadas
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                  <CircleCheckBig className="h-5 w-5 text-emerald-600" />
                </div>

                <span className="text-2xl font-bold text-gray-900">
                  {indicadores.respondidas}
                </span>
              </div>

              <p className="mt-4 text-sm font-semibold text-gray-900">
                Respondidas
              </p>

              <p className="mt-1 text-xs text-gray-500">
                Com retorno disponível
              </p>
            </div>
          </section>

          {/*
           * ====================================================
           * FORMULÁRIO + HISTÓRICO
           * ====================================================
           */}

          <div className="mt-8 grid grid-cols-1 gap-8 xl:grid-cols-[400px_minmax(0,1fr)]">
            {/*
             * ==================================================
             * NOVA DÚVIDA
             * ==================================================
             */}

            <section className="h-fit overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm xl:sticky xl:top-6">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#AF1B1B]/10">
                    <Send className="h-5 w-5 text-[#AF1B1B]" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      Enviar nova dúvida
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      Descreva sua solicitação para a
                      equipe responsável.
                    </p>
                  </div>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="space-y-5 p-6"
              >
                {/* Nome */}

                <div className="space-y-2">
                  <label
                    htmlFor="name"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Nome
                  </label>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Digite seu nome"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#AF1B1B] focus:ring-2 focus:ring-[#AF1B1B]/10"
                    />
                  </div>
                </div>

                {/* E-mail */}

                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-gray-800"
                  >
                    E-mail
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={userEmail || ""}
                      readOnly
                      className="h-11 w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-3 text-sm text-gray-600 outline-none"
                    />
                  </div>

                  <p className="text-xs text-gray-400">
                    Utilizamos o e-mail da sua conta
                    autenticada.
                  </p>
                </div>

                {/* Assunto */}

                <div className="space-y-2">
                  <label
                    htmlFor="subject"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Assunto
                  </label>

                  <div className="relative">
                    <FileQuestion className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      placeholder="Digite o assunto da dúvida"
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#AF1B1B] focus:ring-2 focus:ring-[#AF1B1B]/10"
                    />
                  </div>
                </div>

                {/* Mensagem */}

                <div className="space-y-2">
                  <label
                    htmlFor="message"
                    className="text-sm font-semibold text-gray-800"
                  >
                    Mensagem
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    placeholder="Descreva sua dúvida com o máximo de detalhes possível..."
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-3 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#AF1B1B] focus:ring-2 focus:ring-[#AF1B1B]/10"
                  />
                </div>

                {/* Botão */}

                <button
                  type="submit"
                  disabled={loading || !userEmail}
                  className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#AF1B1B] px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#8C1616] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Enviar dúvida
                    </>
                  )}
                </button>
              </form>
            </section>

            {/*
             * ==================================================
             * MINHAS DÚVIDAS
             * ==================================================
             */}

            <section className="min-w-0">
              <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/*
                 * ================================================
                 * CABEÇALHO DO HISTÓRICO
                 * ================================================
                 */}

                <div className="border-b border-gray-100 px-5 py-5 sm:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">
                        Minhas dúvidas
                      </h2>

                      <p className="mt-1 text-sm text-gray-500">
                        Consulte o histórico e acompanhe o
                        status de cada solicitação.
                      </p>
                    </div>

                    <span className="inline-flex w-fit items-center rounded-full bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
                      {duvidasFiltradas.length}{" "}
                      {duvidasFiltradas.length === 1
                        ? "registro"
                        : "registros"}
                    </span>
                  </div>

                  {/*
                   * ==============================================
                   * BUSCA
                   * ==============================================
                   */}

                  <div className="relative mt-5">
                    <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(e.target.value)
                      }
                      placeholder="Pesquisar por assunto, dúvida ou resposta..."
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-10 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#AF1B1B] focus:ring-2 focus:ring-[#AF1B1B]/10"
                    />
                  </div>

                  {/*
                   * ==============================================
                   * FILTROS
                   * ==============================================
                   */}

                  <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                    {[
                      {
                        key: "todos",
                        label: "Todas",
                      },
                      {
                        key: "aberto",
                        label: "Abertas",
                      },
                      {
                        key: "em_analise",
                        label: "Em análise",
                      },
                      {
                        key: "respondido",
                        label: "Respondidas",
                      },
                      {
                        key: "fechado",
                        label: "Fechadas",
                      },
                    ].map((filter) => {
                      const active =
                        statusFilter ===
                        filter.key;

                      return (
                        <button
                          key={filter.key}
                          type="button"
                          onClick={() =>
                            setStatusFilter(
                              filter.key as StatusFilter
                            )
                          }
                          className={`shrink-0 cursor-pointer rounded-full border px-4 py-2 text-xs font-semibold transition ${
                            active
                              ? "border-[#AF1B1B] bg-[#AF1B1B] text-white"
                              : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/*
                 * ================================================
                 * LISTA
                 * ================================================
                 */}

                <div className="p-4 sm:p-6">
                  {duvidas.length === 0 ? (
                    <div className="flex min-h-[350px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-6 text-center">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
                        <Inbox className="h-6 w-6 text-gray-400" />
                      </div>

                      <h3 className="mt-4 text-sm font-bold text-gray-900">
                        Nenhuma dúvida registrada
                      </h3>

                      <p className="mt-2 max-w-sm text-sm leading-6 text-gray-500">
                        Quando você enviar uma dúvida,
                        ela aparecerá aqui para
                        acompanhamento.
                      </p>
                    </div>
                  ) : duvidasFiltradas.length ===
                    0 ? (
                    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50/50 px-6 text-center">
                      <Search className="h-6 w-6 text-gray-400" />

                      <h3 className="mt-4 text-sm font-bold text-gray-900">
                        Nenhum resultado encontrado
                      </h3>

                      <p className="mt-2 text-sm text-gray-500">
                        Tente alterar sua pesquisa ou o
                        filtro selecionado.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {duvidasFiltradas.map(
                        (item) => {
                          const isExpanded =
                            expandedId === item.id;

                          const status =
                            getStatusConfig(
                              item.status
                            );

                          return (
                            <article
                              key={item.id}
                              className="overflow-hidden rounded-xl border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-sm"
                            >
                              {/*
                               * ==================================
                               * TOPO DO CARD
                               * ==================================
                               */}

                              <div className="p-5 sm:p-6">
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                  <div className="min-w-0 flex-1">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#AF1B1B]">
                                        Solicitação
                                      </span>

                                      <span
                                        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${status.className}`}
                                      >
                                        {status.label}
                                      </span>
                                    </div>

                                    <h3 className="break-words text-base font-bold leading-6 text-gray-900 sm:text-lg">
                                      {item.subject ||
                                        "Sem assunto"}
                                    </h3>

                                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-gray-500">
                                      <div className="flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5" />

                                        <span>
                                          {item.name ||
                                            "—"}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5" />

                                        <span className="break-all">
                                          {item.email ||
                                            "—"}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-1.5">
                                        <Clock3 className="h-3.5 w-3.5" />

                                        <span>
                                          {formatDate(
                                            item.createdAt
                                          )}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/*
                                 * ==================================
                                 * DÚVIDA
                                 * ==================================
                                 */}

                                <div className="mt-5 rounded-lg border border-gray-100 bg-[#FAFAFA] p-4">
                                  <p className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500">
                                    Sua dúvida
                                  </p>

                                  <p className="whitespace-pre-line break-words text-sm leading-6 text-gray-700">
                                    {item.message}
                                  </p>
                                </div>

                                {/*
                                 * ==================================
                                 * RESPOSTA
                                 * ==================================
                                 */}

                                {item.answer && (
                                  <div className="mt-4">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        toggleExpand(
                                          item.id
                                        )
                                      }
                                      aria-expanded={
                                        isExpanded
                                      }
                                      className="flex w-full cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left transition hover:bg-gray-50"
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                                          <CircleCheckBig className="h-4 w-4 text-emerald-600" />
                                        </div>

                                        <div>
                                          <p className="text-sm font-bold text-gray-900">
                                            Resposta do
                                            suporte
                                          </p>

                                          <p className="text-xs text-gray-500">
                                            Clique para{" "}
                                            {isExpanded
                                              ? "ocultar"
                                              : "visualizar"}
                                          </p>
                                        </div>
                                      </div>

                                      {isExpanded ? (
                                        <ChevronUp className="h-5 w-5 text-gray-400" />
                                      ) : (
                                        <ChevronDown className="h-5 w-5 text-gray-400" />
                                      )}
                                    </button>

                                    {isExpanded && (
                                      <div className="mt-3 overflow-hidden rounded-lg border border-emerald-100 bg-emerald-50/40">
                                        <div className="border-l-4 border-emerald-500 p-4 sm:p-5">
                                          <p className="whitespace-pre-line break-words text-sm leading-6 text-gray-800">
                                            {
                                              item.answer
                                            }
                                          </p>

                                          {(item.answeredByName ||
                                            item.answeredAt) && (
                                            <div className="mt-4 flex flex-col gap-1 border-t border-emerald-100 pt-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
                                              {item.answeredByName && (
                                                <span>
                                                  Respondido
                                                  por{" "}
                                                  <strong className="font-semibold text-gray-700">
                                                    {
                                                      item.answeredByName
                                                    }
                                                  </strong>
                                                </span>
                                              )}

                                              {item.answeredAt && (
                                                <span>
                                                  {formatDate(
                                                    item.answeredAt
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </article>
                          );
                        }
                      )}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/*
           * ====================================================
           * BLOCO DE ORIENTAÇÃO
           * ====================================================
           */}

          <section className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#AF1B1B]/10">
                  <MessageCircleQuestion className="h-5 w-5 text-[#AF1B1B]" />
                </div>

                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Precisa de ajuda?
                  </h3>

                  <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">
                    Utilize o formulário acima para
                    registrar sua dúvida. Você poderá
                    acompanhar o andamento e visualizar
                    a resposta diretamente nesta tela.
                  </p>
                </div>
              </div>

              <div className="hidden shrink-0 text-right sm:block">
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                  Projeta
                </p>

                <p className="mt-1 text-sm font-bold text-gray-800">
                  Canal Interno Corporativo
                </p>
              </div>
            </div>
          </section>
        </main>

        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          newestOnTop
        />
      </div>
    </ProtectedRoute>
  );
}