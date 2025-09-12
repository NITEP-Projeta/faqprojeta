"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";

import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/firebase/firebase";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { MinhasDuvidas } from "@/components/MinhasDuvidas";

export default function TiraDuvidasPage() {
  const auth = getAuth();

  const [nameUser, setNameUser] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const emailLoaded = userEmail.length > 0;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserEmail(user?.email ?? "");
    });
    return () => unsubscribe();
  }, [auth]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user || !user.email) {
      toast.error("Faça login para enviar a dúvida.", { position: "top-right" });
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);

    const name = String(data.get("name") || "").trim();
    const subject = String(data.get("subject") || "").trim();
    const message = String(data.get("message") || "").trim();

    if (!name || !subject || !message) {
      toast.error("Preencha todos os campos.", { position: "top-right" });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        uid: user.uid,
        email: user.email,
        name,
        subject,
        message,
        status: "aberto" as const,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, "tiraDuvidas"), payload);
      form.reset();

      toast.success("Obrigado! Sua dúvida foi registrada com sucesso.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        hideProgressBar: false,
        pauseOnHover: true
      });
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar dúvida. Tente novamente mais tarde.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        hideProgressBar: false,
        pauseOnHover: true
      });
    } finally {
      setLoading(false);
    }
  }

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

          {/* Grid principal */}
          <main className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* Card do formulário */}
            <section className="rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="px-5 py-5">
                <h2 className="text-base font-semibold text-gray-900 text-center lg:text-left">
                  Enviar nova dúvida
                </h2>

                <form onSubmit={handleSubmit} className="mt-4 space-y-5">
                  {/* Nome */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                      Nome
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      placeholder="Digite seu nome"
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B0D0D]/50"
                    />
                  </div>

                  {/* E-mail */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                      E-mail
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={userEmail}
                      readOnly
                      className="block w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-900 cursor-not-allowed"
                    />
                  </div>

                  {/* Assunto */}
                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-900">
                      Assunto
                    </label>
                    <input
                      id="subject"
                      name="subject"
                      type="text"
                      required
                      placeholder="Digite o assunto da dúvida"
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B0D0D]/50"
                    />
                  </div>

                  {/* Mensagem */}
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-900">
                      Mensagem
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      placeholder="Digite sua dúvida aqui..."
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B0D0D]/50"
                    />
                  </div>

                  {/* Botão Enviar */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading || !emailLoaded}
                      className="inline-flex w-full items-center justify-center rounded-lg bg-[#8B0D0D] px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#6f0a0a] disabled:opacity-60 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <svg
                            className="animate-spin h-5 w-5 mr-2 text-white"
                            viewBox="0 0 48 48"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect width={48} height={48} fill="white" fillOpacity={0.01} />
                            <path
                              d="M4 24C4 35.0457 12.9543 44 24 44V44C35.0457 44 44 35.0457 44 24C44 12.9543 35.0457 4 24 4"
                              stroke="currentColor"
                              strokeWidth={4}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M36 24C36 17.3726 30.6274 12 24 12C17.3726 12 12 17.3726 12 24C12 30.6274 17.3726 36 24 36V36"
                              stroke="currentColor"
                              strokeWidth={4}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Enviando Dúvida
                        </>
                      ) : (
                        "Enviar Dúvida"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </section>

            {/* Card da lista do usuário */}
            <section className="rounded-2xl bg-white border border-gray-200 shadow-sm">
              <div className="px-5 py-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-gray-900">
                    Minhas dúvidas
                  </h2>
                </div>

                {/* Área da lista */}
                <div className="mt-4">
                  <MinhasDuvidas />
                </div>
              </div>
            </section>
          </main>
        </div>

        {/* Toast global */}
        <ToastContainer />
      </div>
    </ProtectedRoute>
  );
}