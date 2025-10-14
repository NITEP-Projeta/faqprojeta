"use client";

import { useState, useEffect } from "react";
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
import { ChevronDown, ChevronUp } from "lucide-react";

export default function TiraDuvidasPage() {
  const [loading, setLoading] = useState(false);
  const [duvidas, setDuvidas] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null); // controla expansão

  // 🔹 Captura usuário autenticado
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

  // 🔹 Escuta dúvidas do usuário logado
  useEffect(() => {
    if (!userUid) return;

    const q = query(
      collection(db, "tiraDuvidas"),
      where("uid", "==", userUid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setDuvidas(lista);
    });

    return () => unsubscribe();
  }, [userUid]);

  // 🔹 Envio da dúvida
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formElement = e.currentTarget;
      const user = auth.currentUser;
      if (!user) throw new Error("Usuário não autenticado.");

      const form = new FormData(formElement);
      const payload = {
        uid: user.uid,
        name: String(form.get("name")),
        email: user.email,
        subject: String(form.get("subject")),
        message: String(form.get("message")),
        status: "aberto",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "tiraDuvidas"), payload);
      toast.success("Dúvida enviada com sucesso!");
      formElement.reset();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar a dúvida. Verifique suas permissões.");
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Alterna expansão da resposta
  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
          {/* Cabeçalho */}
          <header className="text-center">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Tira Dúvidas
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Envie sua dúvida e acompanhe o retorno do suporte
            </p>
          </header>

          <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* Formulário */}
            <section className="rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="px-5 py-5">
                <h2 className="text-base font-semibold text-gray-900 text-center lg:text-left">
                  Enviar nova dúvida
                </h2>

                <form onSubmit={handleSubmit} className="mt-4 space-y-5">
                  {/* Nome */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Nome
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Digite seu nome"
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B0D0D]/50"
                    />
                  </div>

                  {/* E-mail */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-900"
                    >
                      E-mail
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={userEmail || ""}
                      readOnly
                      className="block w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-900 cursor-not-allowed"
                    />
                  </div>

                  {/* Assunto */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Assunto
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      placeholder="Digite o assunto da dúvida"
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B0D0D]/50"
                    />
                  </div>

                  {/* Mensagem */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Mensagem
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      placeholder="Digite sua dúvida aqui..."
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#8B0D0D]/50"
                    />
                  </div>

                  {/* Botão Enviar */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading || !userEmail}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-[#8B0D0D] px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#6f0a0a] disabled:opacity-60 transition cursor-pointer"
                    >
                      {loading ? "Enviando..." : "Enviar Dúvida"}
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* Lista de dúvidas */}
            <section className="rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="px-5 py-5">
                <h2 className="text-base font-semibold text-gray-900 mb-3">
                  Minhas dúvidas
                </h2>

                {duvidas.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Nenhuma dúvida registrada ainda.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {duvidas.map((item) => {
                      const isExpanded = expandedId === item.id;
                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-gray-100 bg-white shadow-sm p-5"
                        >
                          {/* Cabeçalho */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-base font-semibold text-gray-900">
                                {item.subject || "Sem assunto"}
                              </h3>
                              <p className="text-sm text-gray-500 mt-0.5">
                                <span className="font-semibold text-gray-800">
                                  Nome:
                                </span>{" "}
                                {item.name} <br />
                                <span className="font-semibold text-gray-800">
                                  E-mail:
                                </span>{" "}
                                {item.email}
                              </p>
                            </div>

                            {/* Status */}
                            <span
                              className={`text-xs font-semibold px-3 py-1 rounded-full capitalize ${
                                item.status === "respondido"
                                  ? "bg-green-100 text-green-700"
                                  : item.status === "em_analise" ||
                                    item.status === "em_andamento"
                                  ? "bg-blue-100 text-blue-700"
                                  : item.status === "fechado"
                                  ? "bg-gray-100 text-gray-600"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {item.status || "aberto"}
                            </span>
                          </div>

                          {/* Dúvida */}
                          <div className="mb-3">
                            <p className="text-sm font-semibold text-gray-800 mb-1">
                              Dúvida:
                            </p>
                            <div className="rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700">
                              {item.message}
                            </div>
                          </div>

                          {/* Botão e resposta */}
                          {item.answer && (
                            <div className="mt-2">
                              <button
                                type="button"
                                onClick={() => toggleExpand(item.id)}
                                className="flex items-center text-sm text-[#8B0D0D] font-medium hover:underline focus:outline-none"
                              >
                                {isExpanded ? (
                                  <>
                                    Ocultar resposta{" "}
                                    <ChevronUp className="ml-1 h-4 w-4" />
                                  </>
                                ) : (
                                  <>
                                    Ver resposta{" "}
                                    <ChevronDown className="ml-1 h-4 w-4" />
                                  </>
                                )}
                              </button>

                              {isExpanded && (
                                <div className="mt-3 border-l-4 border-green-600 bg-gray-50 px-4 py-3 rounded-md transition-all duration-200 ease-in-out">
                                  <p className="text-sm text-gray-800 whitespace-pre-line">
                                    <strong>Resposta do suporte:</strong>
                                    <br />
                                    {item.answer}
                                  </p>
                                  {item.answeredByName && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Respondido por{" "}
                                      <strong>{item.answeredByName}</strong>
                                    </p>
                                  )}
                                  {item.answeredAt?.toDate && (
                                    <p className="text-xs text-gray-500">
                                      Respondido em{" "}
                                      {item.answeredAt
                                        .toDate()
                                        .toLocaleString("pt-BR")}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Rodapé */}
                          <p className="text-xs text-gray-400 mt-3">
                            Enviado em{" "}
                            {item.createdAt?.toDate
                              ? item.createdAt
                                  .toDate()
                                  .toLocaleString("pt-BR")
                              : "—"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>

        <ToastContainer position="bottom-right" />
      </div>
    </ProtectedRoute>
  );
}
