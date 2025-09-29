"use client"

import Link from "next/link"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function TiraDuvidasPage() {
  return (
    <ProtectedRoute>
<<<<<<< HEAD
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
      {/* Logo e título */}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Logo da Empresa"
          src="Logotipo_Projeta.png"
          className="mx-auto h-[150] w-[170]"
        />
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          Tira Dúvidas
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Envie sua dúvida e entraremos em contato em breve
        </p>
=======
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
>>>>>>> eb3bf0f15a4ccb79fafa0ed38c922eecd035b75c
      </div>

      {/* Formulário */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white p-8 rounded-lg shadow-md">
        <form action="#" method="POST" className="space-y-6">
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

          {/* E-mail */}
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
                placeholder="Digite seu e-mail"
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
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
              className="flex w-full justify-center rounded-md bg-[#8B0D0D] px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#1A1A1A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all cursor-pointer"
            >
              Enviar Dúvida
            </button>
          </div>
        </form>
      </div>
    </div>
    </ProtectedRoute>
  )
}
