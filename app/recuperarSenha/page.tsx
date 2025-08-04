"use client";

import Link from "next/link";
import { enviarEmailDeRecuperacao } from "@/src/auth";
import { useState } from "react";

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // evita recarregamento

    setMensagem("");
    setErro("");

    try {
      await enviarEmailDeRecuperacao(email);
      setMensagem("Instruções enviadas para o seu e-mail.");
    } catch (err: any) {
      setErro("Erro ao enviar e-mail. Verifique se o endereço está correto.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col justify-center px-6 py-12 lg:px-8 bg-gray-50">
      {/* Logo e título */}
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Logo da Empresa"
          src="Logotipo_Projeta.png"
          className="mx-auto h-[150px] w-[170px]"
        />
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          Recuperar senha
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Informe seu e-mail para enviarmos as instruções de recuperação
        </p>
      </div>

      {/* Formulário */}
      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white p-8 rounded-lg shadow-md border border-gray-300">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Email */}
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail cadastrado"
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Botão Enviar */}
          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-[#8B0D0D] px-3 py-2 text-sm font-semibold text-white shadow-md hover:bg-[#1A1A1A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
            >
              Enviar instruções
            </button>
          </div>
        </form>

        {/* Mensagens de feedback */}
        {mensagem && <p className="mt-4 text-green-600 text-sm text-center">{mensagem}</p>}
        {erro && <p className="mt-4 text-red-600 text-sm text-center">{erro}</p>}

        {/* Link para Login */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Lembrou sua senha?{" "}
          <Link href="/login" className="font-semibold text-[#8B0D0D] hover:text-[#1A1A1A]">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}