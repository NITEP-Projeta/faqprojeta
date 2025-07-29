'use client'

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HelpCircle, ShieldCheck, Target, Eye, HeartHandshake, Car, Book, List, Notebook, Contact } from "lucide-react"
import { MessageCircle } from "lucide-react";

import { Home, Info, FileText } from "lucide-react";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-5">

      {/* HERO */}
      <section className="bg-muted py-20 text-center pt-20">
        <div>
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Bem-vindo ao Canal Interno da <span className="text-primary">Projeta</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Acesse treinamentos, tire dúvidas e acompanhe comunicações institucionais.
          </p>
                {/* MISSÃO, VISÃO, VALORES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center pt-5 pb-5 w-full h-auto">
            {[
              {
                title: 'Missão',
                desc: 'Oferecer soluções em engenharia com excelência técnica, inovação e compromisso com os resultados.',
                icon: <Target className="mx-auto text-primary w-8 h-8" />,
              },
              {
                title: 'Visão',
                desc: 'Ser referência nacional em engenharia consultiva, promovendo desenvolvimento sustentável.',
                icon: <Eye className="mx-auto text-primary w-8 h-8" />,
              },
              {
                title: 'Valores',
                desc: 'Ética, transparência, segurança, melhoria contínua e foco no cliente.',
                icon: <HeartHandshake className="mx-auto text-primary w-8 h-8" />,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="w-auto h-auto sm:w-[300px] sm:h-[250px] flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm rounded-xl border border-border shadow-md hover:shadow-xl p-6 transition-all"
              >
                {item.icon}
                <h2 className="text-xl font-semibold mt-3 mb-2">{item.title}</h2>
                <p className="text-sm text-muted-foreground text-center">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section className="w-auto grid md:grid-cols-3 place-items-center gap-8 pb-8">
        {[
          {
            icon: <Book className="text-red-600 w-8 h-8" />,
            title: "Manual do Colaborador",
            desc: "Conteúdos educativos, vídeos e orientações para todos os setores.",
            href: "/manualColaborador"
          },
          {
            icon: <List className="text-amber-500 w-8 h-8" />,
            title: "Manual Interno",
            desc: "FAQ e suporte para colaboradores com dúvidas sobre os sistemas.",
            href: "/manualInterno"
          },
          {
            icon: <ShieldCheck className="text-green-600 w-8 h-8" />,
            title: "Diretrizes Internas",
            desc: "Acesso restrito para responsáveis por controle e conteúdo interno.",
            href: "/diretrizesInternas"
          },
          {
            icon: <Notebook className="text-green-500 w-8 h-8" />,
            title: "SIPOC",
            desc: "Acesso restrito para responsáveis por controle e conteúdo interno.",
            href: "/sipoc"
          },
          {
            icon: <Car className="text-teal-600 w-8 h-8" />,
            title: "Termo Veículos",
            desc: "Acesso restrito para responsáveis por controle e conteúdo interno.",
            href: "/termoVeiculos"
          },
          {
            icon: <Contact className="text-lime-600 w-8 h-8" />,
            title: "Caderno De Cargos",
            desc: "Acesso restrito para responsáveis por controle e conteúdo interno.",
            href: "/cadernoCargos"
          },
          {
            icon: <HelpCircle className="text-yellow-500 w-8 h-8" />,
            title: "Tira Dúvidas",
            desc: "Acesso restrito para responsáveis por controle e conteúdo interno.",
            href: "/admin"
          },
          {
            icon: <ShieldCheck className="text-green-600 w-8 h-8" />,
            title: "Área Administrativa",
            desc: "Acesso restrito para responsáveis por controle e conteúdo interno.",
            href: "/admin"
          }
        ].map((item, idx) => (
          <div
            key={idx}
            className="relative bg-white border-l-4 rounded-md shadow-sm hover:shadow-lg p-6 flex flex-col items-center text-center w-full transition-transform transform hover:-translate-y-1"
          >
            {/* Ícone */}
            <div className="mb-3">
              {item.icon}
            </div>

            {/* Título */}
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">
              {item.title}
            </h2>

            {/* Descrição */}
            <p className="text-sm text-[#555] mb-4">
              {item.desc}
            </p>

            {/* Botão */}
            <Link href={item.href}>
              <Button className="px-5 py-2 bg-[#D96C06] hover:bg-[#bf5f05] text-white rounded-md transition-all">
                Acessar
              </Button>
            </Link>
          </div>
        ))}
      </section>

      <section>
        <div className="fixed bottom-6 right-6 z-50">
          <button className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition">
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="text-sm text-center text-muted-foreground py-6">
        © {new Date().getFullYear()} Projeta • Sistema Interno Corporativo
      </footer>
    </div>
  )
}
