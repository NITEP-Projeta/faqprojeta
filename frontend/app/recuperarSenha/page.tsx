"use client";

import { useState } from "react";

import Link from "next/link";

import { enviarEmailDeRecuperacao } from "@/src/services/auth";

import { ToastContainer, toast } from "react-toastify";

export default function EsqueciSenhaPage() {

  const [loading, setLoading] = useState(false);

  // Estado para o e-mail
  const [email, setEmail] = useState("");

  const [emailError, setEmailError] = useState("");

  // Estado para desabilitar o botão após o envio
  const [desabilitar, setDesabilitar] = useState(false);

  // Regex para validar e-mail
  const regex = /^[^\s@]+@projetacs\.com$/i;

  // Funções para validação dos campos
  const handleEmailBlur = () => {
    if (!email) {
      setEmailError("⚠️ O campo e-mail é obrigatório.");
      setDesabilitar(true)
    } else if (!regex.test(email)) {
      setEmailError("⚠️ Só aceitamos e-mails do domínio projetacs.com");
      setDesabilitar(true)
    } else {
      setEmailError("");
      setDesabilitar(false)
    }
  };

  // Função para lidar com o envio do e-mail de recuperação
  const handleSubmit = async (e: React.FormEvent) => {
    setLoading(true);
    // Previne o comportamento padrão do formulário
    e.preventDefault();

    try {
      await enviarEmailDeRecuperacao(email);
      // Desabilita o botão para evitar múltiplos envios
      setDesabilitar(true);

      // Exibe mensagem de sucesso
      toast.success("Verifique seu e-mail", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        hideProgressBar: false,
        pauseOnHover: true,
        progress: undefined,
      });
    } catch (err: any) {
      // Se ocorrer um erro, exibe mensagem de erro
      toast.error("Erro ao enviar o e-mail de recuperação.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        hideProgressBar: false,
        pauseOnHover: true,
        progress: undefined,
      });
    } finally {
      setLoading(false);
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
                onBlur={handleEmailBlur}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite seu e-mail cadastrado"
                className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
              />
              {emailError && <p className="mt-4 text-red-600 text-sm text-center">{emailError}</p>}
            </div>
          </div>
          {/* Botão Enviar */}
          <div>
            <button
              type="submit"
              disabled={desabilitar}
              className={`flex w-full justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-md transition-all cursor-pointer
              ${desabilitar ? "bg-gray-400 cursor-not-allowed" : "bg-[#8B0D0D] hover:bg-[#1A1A1A]"}`}
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
                Carregando...
              </>
            ) : (
              "Enviar instruções"
            )}
            </button>
          </div>
        </form>
        
        {/* Link para Login */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Lembrou sua senha?{" "}
          <Link href="/login" className="font-semibold text-[#8B0D0D] hover:text-[#1A1A1A]">
            Voltar para o login
          </Link>
        </p>
        <ToastContainer />
      </div>
    </div>
  );
}