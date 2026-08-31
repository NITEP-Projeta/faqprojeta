"use client";

import {
  useMemo,
  useState,
} from "react";

import Image from "next/image";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  ChevronRight,
  FileText,
  Newspaper,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { ProtectedRoute } from "@/components/ProtectedRoute";

/* ============================================================
   LIGHTBOX
============================================================ */

import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";

import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

/* ============================================================
   TIPOS
============================================================ */

type NewsItem = {
  edition: number;
  title: string;
  slug: string;
  description: string;
};

/* ============================================================
   EDIÇÕES
============================================================ */

const projetaNewsData: NewsItem[] = [
  {
    edition: 1,
    title: "Boletim Semanal - 01",
    slug: "1 EDIÇÃO",
    description:
      "Confira os principais destaques, comunicados e acontecimentos da Projeta.",
  },
  {
    edition: 2,
    title: "Boletim Semanal - 02",
    slug: "2 EDIÇÃO",
    description:
      "Confira os principais destaques, comunicados e acontecimentos da Projeta.",
  },
  {
    edition: 3,
    title: "Boletim Semanal - 03",
    slug: "3 EDIÇÃO",
    description:
      "Confira os principais destaques, comunicados e acontecimentos da Projeta.",
  },
  {
    edition: 4,
    title: "Boletim Semanal - 04",
    slug: "4 EDIÇÃO",
    description:
      "Confira os principais destaques, comunicados e acontecimentos da Projeta.",
  },
  {
    edition: 5,
    title: "Boletim Semanal - 05",
    slug: "5 EDIÇÃO",
    description:
      "Confira os principais destaques, comunicados e acontecimentos da Projeta.",
  },
  {
    edition: 6,
    title: "Boletim Semanal - 06",
    slug: "6 EDIÇÃO",
    description:
      "Confira os principais destaques, comunicados e acontecimentos da Projeta.",
  },
  {
    edition: 7,
    title: "Boletim Semanal - 07",
    slug: "7 EDIÇÃO",
    description:
      "Confira os principais destaques, comunicados e acontecimentos da Projeta.",
  },
  {
    edition: 8,
    title: "Boletim Semanal - 08",
    slug: "8 EDIÇÃO",
    description:
      "Confira os principais destaques, comunicados e acontecimentos da Projeta.",
  },
  {
    edition: 9,
    title: "Boletim Semanal - 09",
    slug: "9 EDIÇÃO",
    description:
      "Confira os principais destaques, comunicados e acontecimentos da Projeta.",
  },
  {
    edition: 10,
    title: "Boletim Semanal - 10",
    slug: "10 EDIÇÃO",
    description:
      "Confira os principais destaques, comunicados e acontecimentos da Projeta.",
  },
  {
    edition: 11,
    title: "Boletim Semanal - 11",
    slug: "11 EDIÇÃO",
    description:
      "Confira os principais destaques, comunicados e acontecimentos da Projeta.",
  },
];

/* ============================================================
   HELPERS
============================================================ */

function getNewsImage(slug: string) {
  return `/images/news/${slug}.jpg`;
}

/* ============================================================
   COMPONENTE
============================================================ */

export default function ProjetaNewsPage() {
  const [open, setOpen] =
    useState(false);

  const [index, setIndex] =
    useState(0);

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  /* ============================================================
     EDIÇÃO MAIS RECENTE
  ============================================================ */

  const latestNews =
    projetaNewsData[
      projetaNewsData.length - 1
    ];

  /* ============================================================
     ARQUIVO
  ============================================================ */

  const archiveNews =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return [
        ...projetaNewsData,
      ]
        .reverse()
        .filter(
          (item) =>
            !search ||
            item.title
              .toLowerCase()
              .includes(search) ||
            String(
              item.edition
            ).includes(search)
        );
    }, [searchTerm]);

  /* ============================================================
     ABRIR EDIÇÃO
  ============================================================ */

  function openEdition(
    edition: number
  ) {
    const originalIndex =
      projetaNewsData.findIndex(
        (item) =>
          item.edition ===
          edition
      );

    if (
      originalIndex === -1
    ) {
      return;
    }

    setIndex(
      originalIndex
    );

    setOpen(true);
  }

  /* ============================================================
     SLIDES
  ============================================================ */

  const lightboxSlides =
    useMemo(
      () =>
        projetaNewsData.map(
          (item) => ({
            src: getNewsImage(
              item.slug
            ),

            title:
              item.title,

            description:
              "Projeta News • Boletim interno corporativo",
          })
        ),
      []
    );

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="mx-auto w-full max-w-[1450px] px-3 py-4 sm:px-5 sm:py-5 lg:px-7">

          {/* =====================================================
              HERO
          ===================================================== */}

          <motion.header
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
            }}
            className="
              relative
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-sm
            "
          >
            {/* IDENTIDADE */}

            <div className="absolute bottom-0 left-0 top-0 w-[4px] bg-[#AF1B1B]" />

            {/* DECORAÇÃO */}

            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#AF1B1B]/[0.045] blur-3xl" />

            <Newspaper
              className="
                pointer-events-none
                absolute
                right-10
                top-1/2
                hidden
                -translate-y-1/2
                text-[#AF1B1B]
                opacity-[0.025]

                xl:block
              "
              size={190}
            />

            <div className="relative px-5 py-5 sm:px-7 sm:py-6 lg:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

                {/* TEXTO */}

                <div className="max-w-3xl">
                  <div className="mb-2 flex items-center gap-2">
                    <Newspaper className="h-4 w-4 text-[#AF1B1B]" />

                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#AF1B1B] sm:text-[11px]">
                      Comunicação Interna
                    </p>
                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-[#171717] sm:text-3xl">
                    Projeta News
                  </h1>

                  <p className="mt-2 max-w-3xl text-[13px] leading-5 text-gray-500 sm:text-sm sm:leading-6">
                    O jornal interno da Projeta. Acompanhe os principais
                    acontecimentos, comunicados, conquistas e novidades da
                    empresa em um único lugar.
                  </p>
                </div>

                {/* INDICADORES */}

                <div className="flex gap-5 sm:gap-7">
                  <div>
                    <p className="text-xl font-black leading-none text-[#171717]">
                      {
                        projetaNewsData.length
                      }
                    </p>

                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                      Edições
                    </p>
                  </div>

                  <div className="h-10 w-px bg-gray-200" />

                  <div>
                    <p className="text-xl font-black leading-none text-[#171717]">
                      {String(
                        latestNews.edition
                      ).padStart(
                        2,
                        "0"
                      )}
                    </p>

                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                      Mais recente
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          {/* =====================================================
              ÚLTIMA EDIÇÃO
          ===================================================== */}

          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.08,
              duration: 0.4,
            }}
            className="mt-5 sm:mt-6"
          >
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5 text-[#AF1B1B]" />

                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#AF1B1B]">
                  Última Edição
                </p>
              </div>

              <h2 className="mt-1 text-lg font-bold text-[#171717] sm:text-xl">
                Destaque da semana
              </h2>
            </div>

            {/* FEATURED */}

            <motion.button
              type="button"
              onClick={() =>
                openEdition(
                  latestNews.edition
                )
              }
              whileTap={{
                scale: 0.995,
              }}
              className="
                group
                grid
                w-full
                cursor-pointer
                overflow-hidden
                rounded-2xl
                border
                border-gray-200
                bg-white
                text-left
                shadow-sm
                transition-all
                duration-300

                hover:border-[#AF1B1B]/25
                hover:shadow-[0_15px_45px_rgba(0,0,0,0.09)]

                lg:grid-cols-[420px_1fr]
                xl:grid-cols-[470px_1fr]
              "
            >
              {/* CAPA */}

              <div
                className="
                  relative
                  min-h-[330px]
                  overflow-hidden
                  bg-gray-100

                  sm:min-h-[430px]

                  lg:min-h-[500px]
                "
              >
                <Image
                  src={getNewsImage(
                    latestNews.slug
                  )}
                  alt={
                    latestNews.title
                  }
                  fill
                  priority
                  sizes="
                    (max-width: 1024px) 100vw,
                    470px
                  "
                  className="
                    object-cover
                    object-top
                    transition-transform
                    duration-700

                    group-hover:scale-[1.025]
                  "
                />

                {/* SOMBRA */}

                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:hidden" />

                {/* BADGE */}

                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[#AF1B1B] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-white shadow-lg">
                  <Sparkles
                    size={11}
                  />

                  Nova edição
                </div>

                {/* MOBILE */}

                <div className="absolute bottom-4 left-4 right-4 lg:hidden">
                  <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/70">
                    Projeta News
                  </p>

                  <p className="mt-1 text-xl font-black text-white">
                    {
                      latestNews.title
                    }
                  </p>
                </div>
              </div>

              {/* CONTEÚDO */}

              <div className="flex flex-col justify-center p-5 sm:p-7 lg:p-10 xl:p-12">
                <div className="hidden lg:block">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-[#AF1B1B]/8 px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-[#AF1B1B]">
                    <Newspaper
                      size={11}
                    />

                    Edição{" "}
                    {String(
                      latestNews.edition
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <h3 className="mt-4 max-w-xl text-3xl font-black tracking-tight text-[#171717] xl:text-4xl">
                    {
                      latestNews.title
                    }
                  </h3>
                </div>

                <p className="mt-3 max-w-2xl text-[12px] leading-6 text-gray-500 sm:text-[13px] lg:mt-4">
                  Acompanhe a edição mais recente do Projeta News e fique por
                  dentro dos principais acontecimentos, comunicados e destaques
                  da empresa.
                </p>

                {/* INFO */}

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-gray-100 pt-5">
                  <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400">
                    <Newspaper
                      size={14}
                    />

                    Boletim interno
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400">
                    <BookOpen
                      size={14}
                    />

                    Leitura digital
                  </div>
                </div>

                {/* CTA */}

                <div className="mt-6 flex items-center gap-2 text-[11px] font-bold text-[#AF1B1B]">
                  Abrir edição

                  <ArrowRight
                    size={15}
                    className="transition-transform duration-200 group-hover:translate-x-1"
                  />
                </div>
              </div>
            </motion.button>
          </motion.section>

          {/* =====================================================
              ARQUIVO
          ===================================================== */}

          <motion.section
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.15,
              duration: 0.4,
            }}
            className="mt-7 sm:mt-8"
          >
            {/* TÍTULO */}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#AF1B1B]">
                  Arquivo
                </p>

                <h2 className="mt-1 text-lg font-bold text-[#171717] sm:text-xl">
                  Todas as edições
                </h2>

                <p className="mt-1 text-xs text-gray-500">
                  Consulte os boletins publicados anteriormente.
                </p>
              </div>

              {/* BUSCA */}

              <div className="relative w-full sm:w-[280px]">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={
                    searchTerm
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchTerm(
                      event.target
                        .value
                    )
                  }
                  placeholder="Buscar edição..."
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-white
                    pl-10
                    pr-10
                    text-[12px]
                    text-gray-900
                    shadow-sm
                    outline-none
                    transition-all

                    placeholder:text-gray-400

                    focus:border-[#AF1B1B]/40
                    focus:ring-4
                    focus:ring-[#AF1B1B]/5
                  "
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() =>
                      setSearchTerm(
                        ""
                      )
                    }
                    className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-[#AF1B1B]"
                    aria-label="Limpar pesquisa"
                  >
                    <X
                      size={14}
                    />
                  </button>
                )}
              </div>
            </div>

            {/* =================================================
                GRID
            ================================================= */}

            {archiveNews.length >
            0 ? (
              <motion.div
                layout
                className="
                  mt-4
                  grid
                  grid-cols-1
                  gap-3

                  min-[480px]:grid-cols-2

                  md:grid-cols-3

                  xl:grid-cols-4

                  2xl:grid-cols-5
                "
              >
                <AnimatePresence>
                  {archiveNews.map(
                    (
                      item,
                      cardIndex
                    ) => {
                      const isLatest =
                        item.edition ===
                        latestNews.edition;

                      return (
                        <motion.button
                          layout
                          key={
                            item.slug
                          }
                          type="button"
                          initial={{
                            opacity: 0,
                            y: 10,
                            scale:
                              0.98,
                          }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                          }}
                          exit={{
                            opacity: 0,
                            scale:
                              0.97,
                          }}
                          transition={{
                            delay:
                              cardIndex *
                              0.025,
                          }}
                          onClick={() =>
                            openEdition(
                              item.edition
                            )
                          }
                          className="
                            group
                            overflow-hidden
                            rounded-2xl
                            border
                            border-gray-200
                            bg-white
                            text-left
                            shadow-sm
                            transition-all
                            duration-300

                            hover:-translate-y-1
                            hover:border-[#AF1B1B]/25
                            hover:shadow-[0_12px_30px_rgba(0,0,0,0.08)]
                          "
                        >
                          {/* CAPA */}

                          <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                            <Image
                              src={getNewsImage(
                                item.slug
                              )}
                              alt={
                                item.title
                              }
                              fill
                              sizes="
                                (max-width: 480px) 100vw,
                                (max-width: 768px) 50vw,
                                (max-width: 1280px) 33vw,
                                20vw
                              "
                              className="
                                object-cover
                                object-top
                                transition-transform
                                duration-500

                                group-hover:scale-[1.035]
                              "
                            />

                            {/* OVERLAY */}

                            <div
                              className="
                                absolute
                                inset-0
                                bg-black/0
                                transition-colors
                                duration-300

                                group-hover:bg-black/10
                              "
                            />

                            {/* HOVER PLAY */}

                            <div
                              className="
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                                opacity-0
                                transition-opacity
                                duration-300

                                group-hover:opacity-100
                              "
                            >
                              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-[#AF1B1B] shadow-xl">
                                <BookOpen
                                  size={17}
                                />
                              </div>
                            </div>

                            {/* EDIÇÃO */}

                            <div className="absolute left-2.5 top-2.5 rounded-md bg-black/65 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur-md">
                              Edição{" "}
                              {String(
                                item.edition
                              ).padStart(
                                2,
                                "0"
                              )}
                            </div>

                            {isLatest && (
                              <div className="absolute right-2.5 top-2.5 rounded-md bg-[#AF1B1B] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-white shadow">
                                Nova
                              </div>
                            )}
                          </div>

                          {/* INFORMAÇÕES */}

                          <div className="p-3.5 sm:p-4">
                            <p className="text-[8px] font-bold uppercase tracking-[0.11em] text-[#AF1B1B]">
                              Projeta News
                            </p>

                            <h3 className="mt-1.5 text-[12px] font-bold leading-5 text-[#171717] sm:text-[13px]">
                              {
                                item.title
                              }
                            </h3>

                            <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                              <span className="flex items-center gap-1.5 text-[9px] font-medium text-gray-400">
                                <FileText
                                  size={11}
                                />

                                Boletim
                              </span>

                              <ChevronRight
                                size={14}
                                className="
                                  text-gray-300
                                  transition-all

                                  group-hover:translate-x-1
                                  group-hover:text-[#AF1B1B]
                                "
                              />
                            </div>
                          </div>
                        </motion.button>
                      );
                    }
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              /* ===============================================
                 VAZIO
              =============================================== */

              <div className="mt-4 flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <Search
                    size={17}
                  />
                </div>

                <h3 className="mt-3 text-sm font-bold text-gray-900">
                  Nenhuma edição encontrada
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Tente pesquisar por outro número de edição.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setSearchTerm(
                      ""
                    )
                  }
                  className="mt-3 text-xs font-semibold text-[#AF1B1B] hover:underline"
                >
                  Limpar pesquisa
                </button>
              </div>
            )}
          </motion.section>

          {/* =====================================================
              SOBRE
          ===================================================== */}

          <motion.section
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.25,
            }}
            className="
              mt-7
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-sm
            "
          >
            <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[auto_1fr_auto] md:items-center">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#AF1B1B]/8 text-[#AF1B1B]">
                <Newspaper
                  size={19}
                />
              </div>

              <div>
                <p className="text-[12px] font-bold text-[#171717]">
                  Informação que aproxima
                </p>

                <p className="mt-1 max-w-3xl text-[11px] leading-5 text-gray-500 sm:text-[12px]">
                  O Projeta News reúne informações relevantes da empresa e
                  fortalece a comunicação entre equipes, projetos e áreas.
                </p>
              </div>

              <div className="hidden items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.08em] text-gray-300 md:flex">
                <CalendarDays
                  size={13}
                />

                Boletim interno
              </div>
            </div>
          </motion.section>

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <footer
            className="py-6 text-center text-[10px] text-gray-400 sm:text-[11px]"
            suppressHydrationWarning
          >
            ©{" "}
            {new Date().getFullYear()}{" "}
            Projeta • Sistema Interno Corporativo
          </footer>
        </div>

        {/* =====================================================
            LIGHTBOX
        ===================================================== */}

        <Lightbox
          open={open}
          close={() =>
            setOpen(false)
          }
          index={index}
          slides={
            lightboxSlides
          }
          plugins={[
            Captions,
            Thumbnails,
          ]}
          carousel={{
            finite: false,
          }}
          controller={{
            closeOnBackdropClick:
              true,
          }}
          thumbnails={{
            position:
              "bottom",
            width: 90,
            height: 120,
            border: 0,
            borderRadius: 8,
            padding: 2,
            gap: 8,
          }}
          captions={{
            showToggle:
              false,
            descriptionTextAlign:
              "center",
          }}
          styles={{
            root: {
              "--yarl__color_backdrop":
                "rgba(15, 15, 15, 0.96)",
            },

            container: {
              backgroundColor:
                "rgba(15, 15, 15, 0.96)",
            },

            slide: {
              padding:
                "16px",
            },

            captionsTitle: {
              color:
                "#ffffff",
              fontSize:
                "0.9rem",
              fontWeight:
                700,
            },

            captionsDescription:
              {
                color:
                  "#a3a3a3",
                fontSize:
                  "0.72rem",
              },
          }}
        />
      </div>
    </ProtectedRoute>
  );
}