"use client";
import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen dark:bg-[#1A1A1A] text-center px-6 gap-6">
      {/* Logotipo */}
      <Image
        src="/Logotipo_Projeta_1.png"
        alt="Logotipo Projeta"
        width={350}
        height={350}
        className="mb-6"
      />

      <div>
        {/* Código e título */}
        <h1 className="mt-2 text-xl font-bold text-[#1A1A1A] dark:text-white">
          Página não encontrada
        </h1>

        {/* Descrição */}
        <p className="mt-2 text-sm text-[#7A7A7A] max-w-md dark:text-gray-400">
          Desculpe, mas a página que você procura não existe, foi movida ou está
          temporariamente indisponível.
        </p>
      </div>

      {/* Botão voltar */}
      <div className="mt-6">
        <Link
          href="/"
          className="inline-block rounded-md bg-[#AF1B1B] text-white px-6 py-3 text-sm font-semibold shadow-md hover:bg-[#D96C06] transition-all duration-300"
        >
          Voltar para a página inicial
        </Link>
      </div>

      {/* Rodapé */}
      <footer className="mt-10 text-sm text-[#7A7A7A] dark:text-gray-500">
        © {new Date().getFullYear()} Projeta Consultoria – Todos os direitos
        reservados.
      </footer>
    </main>
  );
}