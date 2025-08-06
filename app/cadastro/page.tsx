"use client";

import Link from "next/link";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { cadastrarComEmailESenha } from "@/src/auth";

import { sendEmailVerification } from "firebase/auth";

import { setDoc, doc, serverTimestamp } from "firebase/firestore";

import { db } from "@/src/firebase/firebase";

import { ToastContainer, toast } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";

export default function CadastroPage() {
  // Estados para os campos do formulário
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estado para controle de loading
  const [loading, setLoading] = useState(false);

  // Hook para navegação
  const router = useRouter();

  // Regex para validar e-mail
  const regex = /^[^\s@]+@projetacs\.com$/i; 

  // Estados para mensagens de erro
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [nomeError, setNomeError] = useState("");
  const isDisabled = password !== confirmPassword || password === "" || email === "" || nome === "";

  // Funções para validação dos campos
  const handleEmailBlur = () => {
    if (!email) {
      setEmailError("⚠️ O campo e-mail é obrigatório.");
    } else if (!regex.test(email)) {
      setEmailError("⚠️ Só aceitamos e-mails do domínio projetacs.com");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordBlur = () => {
    if (password.length < 6) {
      setErrorMessage("⚠️ A Senha não pode ser menor que 6 caracteres.");
    }else if (password && confirmPassword && password !== confirmPassword) {
      setErrorMessage("⚠️ As senhas não coincidem.");
    } else {
      setErrorMessage("");
    }
  };

  const handleNameBlur = () => {
    if (!nome) {
      setNomeError("⚠️ O campo nome é obrigatório.");
    } else if (nome.length < 10) {
      setNomeError("⚠️ O nome deve ter pelo menos 10 caracteres.");
    } else {
      setNomeError("");
    }
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

    // Previne o comportamento padrão do formulário
    e.preventDefault();

    // Desabilita o botão se houver erros
    if (isDisabled) return;

    setLoading(true);
    try {
      // Verifica se o e-mail já está cadastrado ou cadastra novo usuário
      const userCredential = await cadastrarComEmailESenha(email, password);
      const uid = userCredential.user.uid;

      // Envia o e-mail de verificação
      await sendEmailVerification(userCredential.user);
    
      // Salva os dados do usuário no Firestore
      await setDoc(doc(db, "users", uid), {
        nome,
        email,
        createdAt: serverTimestamp(),
      });

      // Exibe mensagem de sucesso
      toast.warn("Verifique seu e-mail", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        hideProgressBar: false,
        pauseOnHover: true,
        progress: undefined,
      });

      // Redireciona para a página de login
      setTimeout(() => {
        router.push("/login");
      }, 5000);

    } catch (err: any) {

      // Exibe mensagem de erro
      toast.error(err.message || "Erro ao cadastrar usuário.", {
        position: "top-right",
        autoClose: 3000,
        theme: "light",
        hideProgressBar: false,
        pauseOnHover: true,
        progress: undefined,
      });

      // Reseta os estados de loading
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
              onBlur={handleNameBlur}
              placeholder="Digite seu nome completo"
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {nomeError && <p className="mt-4 text-red-600 text-sm text-center">{nomeError}</p>}
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
              onBlur={handleEmailBlur}
              placeholder="Digite seu e-mail"
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {emailError && <p className="mt-4 text-red-600 text-sm text-center">{emailError}</p>}
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
              onBlur={handlePasswordBlur}
              placeholder="Confirme sua senha"
              className="mt-2 block w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={isDisabled}
            className="flex w-full justify-center items-center rounded-md bg-[#8B0D0D] px-3 py-2 text-sm font-semibold text-white hover:bg-[#1A1A1A] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition cursor-pointer"
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
            "Criar Cadastro"
          )}
          </button>
          {errorMessage && <p className="mt-4 text-red-600 text-sm text-center">{errorMessage}</p>}
        </form>

        <p className="mt-8 text-center text-sm text-gray-500">
          Já possui uma conta?{' '}
          <Link href="/login" className="font-semibold text-[#8B0D0D] hover:text-[#1A1A1A]">
            Acesse aqui
          </Link>
        </p>
        <ToastContainer />
      </div>
    </div>
  );
}