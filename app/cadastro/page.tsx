"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cadastrarComEmailESenha } from "@/src/auth";
import { setDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "@/src/firebase/firebase";

export default function CadastroPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      // 1. Cria usuário no Auth
      const userCredential = await cadastrarComEmailESenha(email, password);
      const uid = userCredential.user.uid;

      // 3. Grava dados no Firestore
      await setDoc(doc(db, "users", uid), {
        nome,
        email,
        createdAt: serverTimestamp(),
      });

      // 4. Redireciona
      router.push("/login");
    } catch (err: any) {
      console.error("Erro no cadastro:", err);
      setError(err.message || "Erro ao cadastrar usuário.");
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
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          Crie sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Preencha os campos abaixo para se cadastrar
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm bg-white p-8 rounded-lg shadow-md border border-gray-300">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nome */}
          <div>
            <label htmlFor="nome" className="block text-sm font-medium text-gray-900">
              Nome Completo
            </label>
            <input
              id="nome"
              type="text"
              required
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Digite seu nome completo"
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Digite seu e-mail"
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Crie uma senha"
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Confirmar Senha */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900">
              Confirmar Senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirme sua senha"
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Erro */}
          {error && <p className="text-sm text-red-600">{error}</p>}

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center items-center rounded-md bg-[#8B0D0D] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1A1A1A] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8h-4l3 3-3 3h4a8 8 0 01-8 8v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
              </svg>
            ) : (
              'Criar Conta'
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Já possui uma conta?{' '}
          <Link href="/login" className="font-semibold text-[#8B0D0D] hover:text-[#1A1A1A]">
            Acesse aqui
          </Link>
        </p>
      </div>
    </div>
  );
}