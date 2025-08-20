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

  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const emailLoaded = userEmail.length > 0;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Fonte de verdade: e-mail do Auth (não sobrescreva pelo Firestore)
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

    const form = e.currentTarget; // capture agora
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
        email: user.email,          // do Auth (regras vão validar)
        name,
        subject,
        message,
        status: "aberto" as const,  // status inicial
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
      <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
        {/* Logo e título */}
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
            Tira Dúvidas
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Envie sua dúvida e entraremos em contato em breve
          </p>
        </div>

        {/* Formulário */}
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                Nome
              </label>
              <div className="mt-2">
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Digite seu nome"
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* E-mail (somente leitura, exibido) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                E-mail
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={userEmail}
                  readOnly
                  className="block w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-900 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Assunto */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-900">
                Assunto
              </label>
              <div className="mt-2">
                <input
                  id="subject"
                  name="subject"
                  type="text"
                  required
                  placeholder="Digite o assunto da dúvida"
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Mensagem */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-900">
                Mensagem
              </label>
              <div className="mt-2">
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  placeholder="Digite sua dúvida aqui..."
                  className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Botão Enviar */}
            <div>
              <button
                type="submit"
                disabled={loading || !emailLoaded}
                className="flex w-full justify-center rounded-md bg-[#8B0D0D] px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#1A1A1A] disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all cursor-pointer"
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
          <ToastContainer />
        </div>

        {/* Lista do próprio usuário */}
        <MinhasDuvidas />
      </div>
    </ProtectedRoute>
  );
}
