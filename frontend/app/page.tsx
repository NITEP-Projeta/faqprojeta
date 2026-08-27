"use client";

import Link from "next/link";
import {
  ReactNode,
  useMemo,
  useState,
} from "react";

import { ProtectedRoute } from "@/components/ProtectedRoute";

import {
  ArrowRight,
  Book,
  BriefcaseBusiness,
  Car,
  Contact,
  Eye,
  HeartHandshake,
  HelpCircle,
  Newspaper,
  Notebook,
  PlayCircle,
  Search,
  Share2,
  Target,
  TriangleAlert,
  X,
} from "lucide-react";

type Category =
  | "Todos"
  | "Documentos"
  | "Pessoas"
  | "Comunicação"
  | "Suporte";

type HomeCard = {
  icon: ReactNode;
  title: string;
  desc: string;
  category: Exclude<Category, "Todos">;
  href?: string;
  external?: boolean;
  action?: "modal";
};

const institutionalCards = [
  {
    title: "Missão",
    desc: "Prestar serviços de forma a atender as necessidades de nossos clientes, buscando um contínuo desenvolvimento e rentabilidade.",
    icon: Target,
  },
  {
    title: "Visão",
    desc: "Ser referência em soluções integradas de engenharia no Norte e Nordeste até 2030.",
    icon: Eye,
  },
  {
    title: "Valores",
    desc: "Honestidade, Humanidade, Humildade e Humor.",
    icon: HeartHandshake,
  },
];

const categories: Category[] = [
  "Todos",
  "Documentos",
  "Pessoas",
  "Comunicação",
  "Suporte",
];

const cards: HomeCard[] = [
  {
    icon: <Book className="h-5 w-5" />,
    title: "Manual do Colaborador",
    desc: "Conteúdos educativos, vídeos e orientações para todos os setores.",
    href: "/manualColaborador",
    category: "Documentos",
  },
  {
    icon: <TriangleAlert className="h-5 w-5" />,
    title: "Segurança do Trabalho",
    desc: "Normas e orientações voltadas à prevenção de riscos e proteção dos colaboradores.",
    href: "/segurancaTrabalho",
    category: "Documentos",
  },
  {
    icon: <Notebook className="h-5 w-5" />,
    title: "SIPOC & Organograma",
    desc: "Documentos de referência para análise de fluxos e etapas do processo.",
    href: "/sipoc",
    category: "Documentos",
  },
  {
    icon: <Car className="h-5 w-5" />,
    title: "Termo Veículos",
    desc: "Documentos para controle, uso e responsabilidade sobre veículos da empresa.",
    href: "/termoVeiculos",
    category: "Documentos",
  },
  {
    icon: <Contact className="h-5 w-5" />,
    title: "Caderno de Cargos",
    desc: "Guia com funções, atribuições e requisitos dos cargos corporativos.",
    href: "/cadernoCargos",
    category: "Pessoas",
  },
  {
    icon: <PlayCircle className="h-5 w-5" />,
    title: "Treinamentos",
    desc: "Vídeos explicativos sobre o uso do sistema, funcionalidades, rotinas e boas práticas.",
    href: "/tutorial",
    category: "Pessoas",
  },
  {
    icon: <Newspaper className="h-5 w-5" />,
    title: "Projeta News",
    desc: "Boletins semanais com novidades, resultados e comunicados da Projeta.",
    href: "/projeta-news",
    category: "Comunicação",
  },
  {
    icon: <HelpCircle className="h-5 w-5" />,
    title: "Tira Dúvidas",
    desc: "Canal para envio de perguntas e esclarecimento de dúvidas internas.",
    href: "/faq",
    category: "Suporte",
  },
  {
    icon: <Share2 className="h-5 w-5" />,
    title: "SharePoint Corporativo",
    desc: "Acesso ao SharePoint para documentos e recursos corporativos.",
    href: "https://projeta98.sharepoint.com/sites/Projeta2",
    category: "Documentos",
    external: true,
  },
  {
    icon: <BriefcaseBusiness className="h-5 w-5" />,
    title: "Vagas Internas",
    desc: "Conheça as oportunidades disponíveis e continue desenvolvendo sua carreira dentro da Projeta.",
    category: "Pessoas",
    action: "modal",
  },
];

export default function HomePage() {
  const [openForm, setOpenForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedCategory, setSelectedCategory] =
    useState<Category>("Todos");

  const filteredCards = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return cards.filter((item) => {
      const categoryMatch =
        selectedCategory === "Todos" ||
        item.category === selectedCategory;

      const searchMatch =
        !search ||
        item.title.toLowerCase().includes(search) ||
        item.desc.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search);

      return categoryMatch && searchMatch;
    });
  }, [searchTerm, selectedCategory]);

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("Todos");
  }

  function renderCard(
    item: HomeCard,
    index: number
  ) {
    const content = (
      <article
        className="
          projeta-card
          projeta-reveal
          group
          flex
          h-full
          flex-col
          rounded-xl
          border
          border-gray-200
          bg-white
          p-4
          active:bg-gray-50

          sm:min-h-[150px]
          sm:p-5

          hover:border-[#AF1B1B]/30
          hover:shadow-md
        "
        style={{
          animationDelay: `${80 + index * 45}ms`,
        }}
      >
        <div className="flex items-start gap-3">
          {/* ÍCONE */}

          <div
            className="
              projeta-icon
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-lg
              bg-[#AF1B1B]/8
              text-[#AF1B1B]
            "
          >
            {item.icon}
          </div>

          {/* TEXTO */}

          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-bold leading-5 text-[#171717] sm:text-[15px]">
              {item.title}
            </h3>

            <p className="mt-1 text-[12px] leading-[18px] text-gray-500 sm:text-[13px] sm:leading-5">
              {item.desc}
            </p>
          </div>

          {/* SETA */}

          <ArrowRight
            className="
              projeta-arrow
              mt-1
              h-4
              w-4
              shrink-0
              text-gray-300

              group-hover:text-[#AF1B1B]
            "
          />
        </div>
      </article>
    );

    if (item.action === "modal") {
      return (
        <button
          key={item.title}
          type="button"
          onClick={() => setOpenForm(true)}
          className="h-full w-full cursor-pointer text-left"
        >
          {content}
        </button>
      );
    }

    if (item.external && item.href) {
      return (
        <a
          key={item.title}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          className="h-full"
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        key={item.title}
        href={item.href ?? "#"}
        className="h-full"
      >
        {content}
      </Link>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-full bg-[#F5F5F5]">
        <div
          className="
            mx-auto
            w-full
            max-w-[1450px]
            px-3
            py-4

            sm:px-5
            sm:py-5

            lg:px-7
          "
        >
          {/* =====================================================
              TOPO
          ===================================================== */}

          <section
            className="
              projeta-reveal
              overflow-hidden
              rounded-xl
              border
              border-gray-200
              bg-white
              shadow-sm

              sm:rounded-2xl
            "
          >
            {/* APRESENTAÇÃO */}

            <div className="px-4 py-4 sm:px-7 sm:py-6 lg:px-8">
              <p
                className="
                  projeta-reveal
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.15em]
                  text-[#AF1B1B]

                  sm:text-[11px]
                "
                style={{
                  animationDelay: "60ms",
                }}
              >
                Canal Interno Projeta
              </p>

              <h1
                className="
                  projeta-reveal
                  mt-1.5
                  max-w-4xl
                  text-xl
                  font-black
                  leading-7
                  tracking-tight
                  text-[#171717]

                  sm:text-2xl
                  lg:text-3xl
                "
                style={{
                  animationDelay: "100ms",
                }}
              >
                Bem-vindo ao Canal Interno da Projeta
              </h1>

              <p
                className="
                  projeta-reveal
                  mt-1.5
                  max-w-3xl
                  text-[12px]
                  leading-5
                  text-gray-500

                  sm:mt-2
                  sm:text-sm
                  sm:leading-6
                "
                style={{
                  animationDelay: "140ms",
                }}
              >
                Acesse documentos, treinamentos, comunicados e serviços
                internos para apoiar sua rotina de trabalho.
              </p>
            </div>

            {/* ===================================================
                MISSÃO / VISÃO / VALORES
            =================================================== */}

            <div className="grid grid-cols-1 border-t border-gray-200 md:grid-cols-3">
              {institutionalCards.map(
                (item, index) => {
                  const Icon = item.icon;

                  return (
                    <article
                      key={item.title}
                      className={`
                        projeta-reveal
                        group
                        px-4
                        py-4
                        transition-colors
                        duration-200

                        hover:bg-[#FAFAFA]

                        sm:px-5

                        lg:px-6
                        lg:py-5

                        ${
                          index !== institutionalCards.length - 1
                            ? "border-b border-gray-200 md:border-b-0 md:border-r"
                            : ""
                        }
                      `}
                      style={{
                        animationDelay: `${180 + index * 70}ms`,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="
                            projeta-icon
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#AF1B1B]/8
                          "
                        >
                          <Icon className="h-[17px] w-[17px] text-[#AF1B1B]" />
                        </div>

                        <div className="min-w-0">
                          <h2 className="text-[13px] font-bold text-[#171717] sm:text-sm">
                            {item.title}
                          </h2>

                          <p className="mt-1 text-[11px] leading-[17px] text-gray-500 sm:text-[12px] sm:leading-[18px]">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                }
              )}
            </div>
          </section>

          {/* =====================================================
              BIBLIOTECA
          ===================================================== */}

          <section
            className="projeta-reveal mt-5 sm:mt-6"
            style={{
              animationDelay: "280ms",
            }}
          >
            {/* TÍTULO */}

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#AF1B1B] sm:text-[11px]">
                Biblioteca Corporativa
              </p>

              <h2 className="mt-1 text-[20px] font-bold leading-7 text-[#171717] sm:text-xl">
                Acessos do colaborador
              </h2>

              <p className="mt-1 hidden text-xs text-gray-500 sm:block">
                Encontre rapidamente documentos, serviços e conteúdos internos.
              </p>
            </div>

            {/* ===================================================
                BUSCA + FILTROS
            =================================================== */}

            <div
              className="
                projeta-reveal
                mt-4
                rounded-2xl
                border
                border-gray-200
                bg-white
                p-3
                shadow-sm

                sm:p-4
              "
              style={{
                animationDelay: "330ms",
              }}
            >
              {/* BUSCA */}

              <div className="group relative w-full">
                <Search
                  className="
                    pointer-events-none
                    absolute
                    left-3.5
                    top-1/2
                    h-[18px]
                    w-[18px]
                    -translate-y-1/2
                    text-gray-400
                    transition-all
                    duration-200

                    group-focus-within:scale-110
                    group-focus-within:text-[#AF1B1B]
                  "
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value);

                    if (event.target.value) {
                      setSelectedCategory("Todos");
                    }
                  }}
                  placeholder="O que você procura?"
                  className="
                    projeta-input
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-[#FAFAFA]
                    pl-11
                    pr-10
                    text-[14px]
                    text-gray-900
                    outline-none

                    placeholder:text-gray-400

                    focus:border-[#AF1B1B]/40
                    focus:bg-white
                    focus:ring-4
                    focus:ring-[#AF1B1B]/5

                    sm:h-11
                    sm:text-[13px]
                  "
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchTerm("")
                    }
                    className="
                      projeta-pop
                      projeta-button
                      absolute
                      right-2
                      top-1/2
                      flex
                      h-8
                      w-8
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-lg
                      text-gray-400

                      hover:bg-gray-100
                      hover:text-gray-600
                    "
                    aria-label="Limpar pesquisa"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* =================================================
                  FILTROS
              ================================================= */}

              <div className="mt-3">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                  Filtrar por
                </p>

                <div className="flex flex-wrap gap-2">
                  {categories.map(
                    (category, index) => {
                      const active =
                        selectedCategory === category;

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() =>
                            setSelectedCategory(category)
                          }
                          className={`
                            projeta-button
                            projeta-reveal
                            min-h-[38px]
                            shrink-0
                            cursor-pointer
                            rounded-xl
                            border
                            px-3.5
                            text-[12px]
                            font-semibold
                            transition-all

                            ${
                              active
                                ? "border-[#AF1B1B] bg-[#AF1B1B] text-white shadow-[0_5px_14px_rgba(175,27,27,0.18)]"
                                : "border-gray-200 bg-white text-gray-600 hover:border-[#AF1B1B]/30 hover:bg-[#AF1B1B]/5 hover:text-[#AF1B1B]"
                            }
                          `}
                          style={{
                            animationDelay: `${360 + index * 35}ms`,
                          }}
                        >
                          {category}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>

            {/* ===================================================
                RESULTADO
            =================================================== */}

            {(searchTerm ||
              selectedCategory !== "Todos") && (
              <div className="projeta-fade mt-3 flex items-center justify-between gap-3">
                <p className="text-[11px] text-gray-500">
                  <strong className="font-semibold text-gray-700">
                    {filteredCards.length}
                  </strong>{" "}
                  {filteredCards.length === 1
                    ? "recurso encontrado"
                    : "recursos encontrados"}
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="projeta-button shrink-0 text-[11px] font-semibold text-[#AF1B1B] hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            )}

            {/* ===================================================
                CARDS
            =================================================== */}

            {filteredCards.length > 0 ? (
              <div
                key={`${selectedCategory}-${searchTerm}`}
                className="
                  mt-4
                  grid
                  grid-cols-1
                  gap-3

                  sm:grid-cols-2
                  sm:gap-4

                  xl:grid-cols-3

                  2xl:grid-cols-4
                "
              >
                {filteredCards.map(
                  (item, index) =>
                    renderCard(item, index)
                )}
              </div>
            ) : (
              <div
                className="
                  projeta-modal-content
                  mt-4
                  flex
                  min-h-[190px]
                  flex-col
                  items-center
                  justify-center
                  rounded-xl
                  border
                  border-dashed
                  border-gray-200
                  bg-white
                  p-6
                  text-center
                "
              >
                <div
                  className="
                    projeta-pop
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-full
                    bg-gray-100
                  "
                >
                  <Search className="h-5 w-5 text-gray-400" />
                </div>

                <h3 className="mt-3 text-[13px] font-bold text-gray-900">
                  Nenhum recurso encontrado
                </h3>

                <p className="mt-1 text-[11px] text-gray-500">
                  Tente outro termo ou categoria.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="projeta-button mt-3 text-[11px] font-semibold text-[#AF1B1B]"
                >
                  Limpar pesquisa
                </button>
              </div>
            )}
          </section>

          {/* =====================================================
              RODAPÉ
          ===================================================== */}

          <footer
            className="projeta-fade py-5 text-center text-[10px] text-gray-400 sm:py-6 sm:text-[11px]"
            suppressHydrationWarning
          >
            © {new Date().getFullYear()} Projeta • Sistema Interno Corporativo
          </footer>
        </div>

        {/* =====================================================
            MODAL VAGAS
        ===================================================== */}

        {openForm && (
          <div
            className="
              projeta-modal-overlay
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/75

              sm:p-3
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="vagas-home-title"
          >
            <div
              className="
                projeta-modal-content
                flex
                h-[100dvh]
                w-full
                flex-col
                overflow-hidden
                bg-white

                sm:h-[94vh]
                sm:max-w-6xl
                sm:rounded-2xl
                sm:shadow-2xl
              "
            >
              <div className="flex min-h-[64px] shrink-0 items-center justify-between border-b border-gray-200 px-4 sm:px-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#AF1B1B]">
                    Oportunidades
                  </p>

                  <h2
                    id="vagas-home-title"
                    className="mt-0.5 text-base font-bold text-[#171717]"
                  >
                    Vagas Internas
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setOpenForm(false)
                  }
                  className="
                    projeta-button
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-gray-200
                    text-gray-500

                    hover:bg-[#AF1B1B]
                    hover:text-white
                  "
                  aria-label="Fechar formulário"
                >
                  <X className="h-[18px] w-[18px]" />
                </button>
              </div>

              <div className="min-h-0 flex-1">
                <iframe
                  src="https://forms.office.com/Pages/ResponsePage.aspx?id=aggIEcw610KuWinVc3B1mZq4vipk6y1MssYGpwNGf0JUNldZTDNKM1pTMTdSV1lNRDZTNUNPNTdLWS4u&embed=true"
                  title="Formulário de Vagas Internas"
                  className="h-full w-full"
                  style={{
                    border: "none",
                  }}
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}