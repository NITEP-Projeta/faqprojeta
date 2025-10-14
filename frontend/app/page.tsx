'use client';

import Link from "next/link";

import { Button } from "@/components/ui/button";

import { HelpCircle, ShieldCheck, Target, Eye, HeartHandshake, Car, Book, List, Notebook, Contact, CalendarCheck2 } from "lucide-react";

import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function HomePage() {
  return (
  // Proteção de rota para garantir que apenas usuários autenticados acessem a página
  <ProtectedRoute>
    {/* Div principal que contém todo o conteúdo da página */}
    <div className="flex flex-col items-center justify-center gap-5"> 
      {/* SEÇÃO DE BEM-VINDO */}
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
                icon: <Target className="mx-auto text-[#AF1B1B] w-8 h-8" />,
              },
              {
                title: 'Visão',
                desc: 'Ser referência nacional em engenharia consultiva, promovendo desenvolvimento sustentável.',
                icon: <Eye className="mx-auto text-[#AF1B1B] w-8 h-8" />,
              },
              {
                title: 'Valores',
                desc: 'Ética, transparência, segurança, melhoria contínua e foco no cliente.',
                icon: <HeartHandshake className="mx-auto text-[#AF1B1B] w-8 h-8" />,
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
      {/* Cards principais */}
      <section className="w-auto grid md:grid-cols-3 place-items-center gap-8 pb-8">
        {[
          {
            icon: <Book className="w-8 h-8" />,
            title: "Manual do Colaborador",
            desc: "Conteúdos educativos, vídeos e orientações para todos os setores.",
            href: "/manualColaborador"
          },
          {
            icon: <List className="w-8 h-8" />,
            title: "Manual Interno",
            desc: "FAQ e suporte para colaboradores com dúvidas sobre os sistemas.",
            href: "/manualInterno"
          },
          {
            icon: <ShieldCheck className="w-8 h-8" />,
            title: "Diretrizes Internas",
            desc: "Guia com procedimentos e padrões adotados pela organização.",
            href: "/diretrizesInternas"
          },
          {
            icon: <Notebook className="w-8 h-8" />,
            title: "SIPOC",
            desc: "Documentos de referência para análise de fluxos e etapas do processo.",
            href: "/sipoc"
          },
          {
            icon: <Car className="w-8 h-8" />,
            title: "Termo Veículos",
            desc: "Documentos para controle, uso e responsabilidade sobre veículos da empresa.",
            href: "/termoVeiculos"
          },
          {
            icon: <Contact className="w-8 h-8" />,
            title: "Caderno De Cargos",
            desc: "Guia com funções, atribuições e requisitos dos cargos corporativos.",
            href: "/cadernoCargos"
          },
          {
            icon: <CalendarCheck2 className="w-8 h-8" />,
            title: "Manual de Ponto",
            desc: "Orientações e diretrizes para registro e gestão de ponto eletrônico.",
            href: "/ponto"
          },
          {
            icon: <HelpCircle className="w-8 h-8" />,
            title: "Tira Dúvidas",
            desc: "Canal para envio de perguntas e esclarecimento de dúvidas internas.",
            href: "/faq"
          },
          {
            icon: <ShieldCheck className="w-8 h-8" />,
            title: "Área Administrativa",
            desc: "Acesso restrito para responsáveis por controle e conteúdo interno.",
            href: "/admin"
          }
        ].map((item, idx) => (
          <div
            key={idx}
            className="relative bg-white border-l-4 rounded-md shadow-sm hover:shadow-lg p-6 flex flex-col items-center text-center w-full transition-transform transform hover:-translate-y-1">
            <div className="mb-3 text-[#AF1B1B]">
              {item.icon}
            </div>
            <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">
              {item.title}
            </h2>
            <p className="text-sm text-[#555] mb-4">
              {item.desc}
            </p>
            <Link href={item.href}>
              <Button className="px-5 py-2 bg-[#AF1B1B] text-white rounded-md transition-all cursor-pointer hover:bg-[#8C1616] transition-all duration-300 ease-in-out 
hover:scale-105 hover:shadow-lg">
                Acessar
              </Button>
            </Link>
          </div>
        ))}
      </section>
      <footer className="text-sm text-center text-muted-foreground py-6">
        © {new Date().getFullYear()} Projeta • Sistema Interno Corporativo
      </footer>
    </div>
  </ProtectedRoute>
  )
}
