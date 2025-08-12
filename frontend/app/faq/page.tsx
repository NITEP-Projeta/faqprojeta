"use client"

import Link from "next/link"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function TiraDuvidasPage() {
  return (
    <ProtectedRoute>
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
