"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import {
  HelpCircle,
  ShieldCheck,
  Target,
  Eye,
  HeartHandshake,
  Car,
  Book,
  Notebook,
  Contact,
  Newspaper,
  Share2,
  TriangleAlert,
  PlayCircle,
  FileText,
} from "lucide-react";

type HomeCard =
  | {
      icon: React.ReactNode;
      title: string;
      desc: string;
      href: string;
      action?: never;
    }
  | {
      icon: React.ReactNode;
      title: string;
      desc: string;
      action: "modal";
      href?: never;
    };

export default function HomePage() {
  const [openForm, setOpenForm] = useState(false);

  const cards: HomeCard[] = [
    {
      icon: <Book className="w-8 h-8" />,
      title: "Manual do Colaborador",
      desc: "Conteúdos educativos, vídeos e orientações para todos os setores.",
      href: "/manualColaborador",
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: "Regimento Interno",
      desc: "Guia com procedimentos e padrões adotados pela organização.",
      href: "/diretrizesInternas",
    },
    {
      icon: <TriangleAlert className="w-8 h-8" />,
      title: "Segurança do Trabalho",
      desc: "Normas de orientações voltadas à prevenção de riscos e proteção dos colaboradores.",
      href: "/segurancaTrabalho",
    },
    {
      icon: <Notebook className="w-8 h-8" />,
      title: "SIPOC",
      desc: "Documentos de referência para análise de fluxos e etapas do processo.",
      href: "/sipoc",
    },
    {
      icon: <Car className="w-8 h-8" />,
      title: "Termo Veículos",
      desc: "Documentos para controle, uso e responsabilidade sobre veículos da empresa.",
      href: "/termoVeiculos",
    },
    {
      icon: <Contact className="w-8 h-8" />,
      title: "Caderno De Cargos",
      desc: "Guia com funções, atribuições e requisitos dos cargos corporativos.",
      href: "/cadernoCargos",
    },
    {
      icon: <PlayCircle className="w-8 h-8" />,
      title: "Treinamentos",
      desc: "Vídeos explicativos sobre o uso do sistema, incluindo funcionalidades, rotinas e boas práticas de navegação.",
      href: "/tutorial",
    },
    {
      icon: <Newspaper className="w-8 h-8" />,
      title: "Projeta News",
      desc: "Boletins semanais com novidades, resultados e comunicados da Projeta.",
      href: "/projeta-news",
    },
    {
      icon: <HelpCircle className="w-8 h-8" />,
      title: "Tira Dúvidas",
      desc: "Canal para envio de perguntas e esclarecimento de dúvidas internas.",
      href: "/faq",
    },
    {
      icon: <Share2 className="w-8 h-8" />,
      title: "Sharepoint Corporativo",
      desc: "Acesso ao Sharepoint para documentos e recursos corporativos",
      href: "https://projeta98.sharepoint.com/sites/Projeta2",
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Processo Seletivo Interno",
      desc: "Preenchimento de solicitações e registros corporativos.",
      action: "modal",
    },
  ];

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-center gap-5">
        <section className="bg-muted py-20 text-center pt-20">
          <div>
            <h1 className="text-5xl font-bold tracking-tight mb-4">
              Bem-vindo ao Canal Interno da <span className="text-primary">Projeta</span>
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Acesse treinamentos, tire dúvidas e acompanhe comunicações institucionais.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center pt-5 pb-5 w-full h-auto">
              {[
                {
                  title: "Missão",
                  desc: "Prestar serviços de forma a atender as necessidades de nossos clientes, buscando um contínuo desenvolvimento e rentabilidade.",
                  icon: <Target className="mx-auto text-[#AF1B1B] w-8 h-8" />,
                },
                {
                  title: "Visão",
                  desc: "Ser referência em soluções integradas de engenharia no Norte e Nordeste até 2030.",
                  icon: <Eye className="mx-auto text-[#AF1B1B] w-8 h-8" />,
                },
                {
                  title: "Valores",
                  desc: "Honestidade, Humanidade, Humildade e Humor",
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

        <section className="w-auto grid md:grid-cols-3 place-items-center gap-8 pb-8">
          {cards.map((item, idx) => (
            <div
              key={idx}
              className="relative bg-white border-l-4 rounded-md shadow-sm hover:shadow-lg p-6 flex flex-col items-center text-center w-full transition-transform transform hover:-translate-y-1"
            >
              <div className="mb-3 text-[#AF1B1B]">{item.icon}</div>

              <h2 className="text-lg font-semibold text-[#1A1A1A] mb-2">
                {item.title}
              </h2>

              <p className="text-sm text-[#555] mb-4">{item.desc}</p>

              {"action" in item && item.action === "modal" ? (
                <Button
                  onClick={() => setOpenForm(true)}
                  className="px-5 py-2 bg-[#AF1B1B] text-white rounded-md cursor-pointer hover:bg-[#8C1616] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                >
                  Acessar
                </Button>
              ) : (
                <Link href={item.href}>
                  <Button className="px-5 py-2 bg-[#AF1B1B] text-white rounded-md cursor-pointer hover:bg-[#8C1616] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                    Acessar
                  </Button>
                </Link>
              )}
            </div>
          ))}
        </section>

        {openForm && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="relative w-full max-w-5xl h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
              <div className="border-b px-5 py-4">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  Formulário Corporativo
                </h2>
                <p className="text-sm text-[#666]">Preencha o formulário abaixo.</p>
              </div>

              <div className="flex-1">
                <iframe
                  src="https://forms.office.com/Pages/ResponsePage.aspx?id=aggIEcw610KuWinVc3B1mZq4vipk6y1MssYGpwNGf0JUNldZTDNKM1pTMTdSV1lNRDZTNUNPNTdLWS4u&embed=true"
                  className="w-full h-full"
                  style={{ border: "none" }}
                  allowFullScreen
                />
              </div>

              <button
                onClick={() => setOpenForm(false)}
                className="absolute top-4 right-4 bg-[#AF1B1B] hover:bg-[#8C1616] text-white p-2 rounded-full shadow-md cursor-pointer"
                aria-label="Fechar formulário"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <footer className="text-sm text-center text-muted-foreground py-6">
          © {new Date().getFullYear()} Projeta • Sistema Interno Corporativo
        </footer>
      </div>
    </ProtectedRoute>
  );
}