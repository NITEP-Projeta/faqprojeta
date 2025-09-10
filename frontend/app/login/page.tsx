"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, signOut, UserCredential } from "firebase/auth";
import { auth } from "@/src/auth";
import { ToastContainer, toast } from "react-toastify";
import { logAnalyticsEvent } from "@/src/firebase/analytics.client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isDisabled = password === "" || email === "";

  const regex = /^[^\s@]+@projetacs\.com$/i;
  const [emailError, setEmailError] = useState("");

  const handleEmail = () => {
    if (!email) {
      setEmailError("⚠️ O campo e-mail é obrigatório.");
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isDisabled) return;

    try {
      // Login do usuário
      const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
      
      await logAnalyticsEvent("login", { method: "password", debug_mode: true });
      const user = userCredential.user;

      // Verificação se o e-mail foi confirmado
      if (!user.emailVerified) {
        // Se ocorrer um erro, exibe mensagem de erro
        toast.error("E-mail não verificado", {
          position: "top-right",
          autoClose: 3000,
          theme: "light",
          hideProgressBar: false,
          pauseOnHover: true,
          progress: undefined,
        });
        await signOut(auth);
        return;
      }

      router.push("/");
    } catch (err: any) {
      // Se ocorrer um erro, exibe mensagem de erro
      toast.error('E-mail ou senha incorretas', {
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
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Logo da Empresa"
          src="/Logotipo_Projeta.png"
          className="mx-auto h-[150px] w-[170px]"
        />
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
          Acesse sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Insira suas credenciais para continuar
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white p-8 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm text-center bg-red-100 p-2 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              E-mail:
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onBlur={handleEmail}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {emailError && <p className="mt-4 text-red-600 text-sm text-center">{emailError}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                Senha:
              </label>
              <div className="text-sm">
                <Link
                  href="/recuperarSenha"
                  className="font-semibold text-[#8B0D0D] hover:text-[#1A1A1A]"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isDisabled}
            className="w-full flex justify-center rounded-md bg-[#8B0D0D] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1A1A1A] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 cursor-pointer"
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
            "Entrar"
          )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Não possui conta?{" "}
          <Link href="/cadastro" className="font-semibold text-[#8B0D0D] hover:text-[#1A1A1A]">
            Cadastre-se agora
          </Link>
        </p>
        <ToastContainer/>
      </div>
    </div>
  );
}
