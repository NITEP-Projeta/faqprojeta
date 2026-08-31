"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { YouTubeEmbed } from "@next/third-parties/google";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  FileText,
  GraduationCap,
  Play,
  PlayCircle,
  Search,
  Sparkles,
  Video,
  X,
} from "lucide-react";

import { ProtectedRoute } from "@/components/ProtectedRoute";

/* ============================================================
   TIPOS
============================================================ */

type VideoCategory =
  | "Todos"
  | "Recursos Humanos"
  | "Operacional";

type ItemCategory = Exclude<
  VideoCategory,
  "Todos"
>;

type VideoItem = {
  title: string;
  description: string;
  videoId: string;
  category: ItemCategory;
  icon: React.ReactNode;
};

/* ============================================================
   CATEGORIAS
============================================================ */

const categories: VideoCategory[] = [
  "Todos",
  "Recursos Humanos",
  "Operacional",
];

/* ============================================================
   VÍDEOS
============================================================ */

const videosData: VideoItem[] = [
  {
    title: "Atestado Médico",
    description:
      "Orientações sobre o envio e registro de atestados médicos, incluindo prazos e procedimentos internos.",
    videoId: "hSN4PtOcEE4",
    category: "Recursos Humanos",
    icon: <FileText size={20} />,
  },

  {
    title:
      "Inclusão de Saldo no Banco de Horas",
    description:
      "Passo a passo para lançamento e acompanhamento de saldo no banco de horas dentro do sistema.",
    videoId: "mqzn2g4_RJk",
    category: "Recursos Humanos",
    icon: <Clock size={20} />,
  },

  {
    title:
      "Inserção de Evento à Disposição",
    description:
      "Procedimento para registro de eventos à disposição, com orientações sobre preenchimento correto no sistema.",
    videoId: "6W9yZ60L2kY",
    category: "Operacional",
    icon: <ClipboardList size={20} />,
  },
];

/* ============================================================
   COMPONENTE
============================================================ */

export default function VideosTreinamentoPage() {
  const [
    selectedVideoId,
    setSelectedVideoId,
  ] = useState<string | null>(
    null
  );

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<VideoCategory>("Todos");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  /* ============================================================
     VÍDEO SELECIONADO
  ============================================================ */

  const selectedVideo =
    useMemo(() => {
      return (
        videosData.find(
          (item) =>
            item.videoId ===
            selectedVideoId
        ) ?? null
      );
    }, [selectedVideoId]);

  /* ============================================================
     ÍNDICE SELECIONADO
  ============================================================ */

  const selectedVideoIndex =
    useMemo(() => {
      if (!selectedVideo) {
        return -1;
      }

      return videosData.findIndex(
        (item) =>
          item.videoId ===
          selectedVideo.videoId
      );
    }, [selectedVideo]);

  /* ============================================================
     FILTRO
  ============================================================ */

  const filteredVideos =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return videosData.filter(
        (item) => {
          const categoryMatch =
            selectedCategory ===
              "Todos" ||
            item.category ===
              selectedCategory;

          const searchMatch =
            !search ||
            item.title
              .toLowerCase()
              .includes(search) ||
            item.description
              .toLowerCase()
              .includes(search) ||
            item.category
              .toLowerCase()
              .includes(search);

          return (
            categoryMatch &&
            searchMatch
          );
        }
      );
    }, [
      searchTerm,
      selectedCategory,
    ]);

  /* ============================================================
     FEATURED
  ============================================================ */

  const featuredVideo =
    filteredVideos[0] ?? null;

  const remainingVideos =
    featuredVideo
      ? filteredVideos.slice(1)
      : [];

  /* ============================================================
     AÇÕES
  ============================================================ */

  function openVideo(
    videoId: string
  ) {
    setSelectedVideoId(
      videoId
    );
  }

  function closeVideo() {
    setSelectedVideoId(null);
  }

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory(
      "Todos"
    );
  }

  /* ============================================================
     PRÓXIMO / ANTERIOR
  ============================================================ */

  function previousVideo() {
    if (
      selectedVideoIndex <= 0
    ) {
      return;
    }

    setSelectedVideoId(
      videosData[
        selectedVideoIndex - 1
      ].videoId
    );
  }

  function nextVideo() {
    if (
      selectedVideoIndex < 0 ||
      selectedVideoIndex >=
        videosData.length - 1
    ) {
      return;
    }

    setSelectedVideoId(
      videosData[
        selectedVideoIndex + 1
      ].videoId
    );
  }

  /* ============================================================
     MODAL + TECLADO
  ============================================================ */

  useEffect(() => {
    if (!selectedVideo) {
      document.body.style.overflow =
        "";

      return;
    }

    document.body.style.overflow =
      "hidden";

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape"
      ) {
        closeVideo();

        return;
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        setSelectedVideoId(
          (currentId) => {
            const index =
              videosData.findIndex(
                (item) =>
                  item.videoId ===
                  currentId
              );

            if (index <= 0) {
              return currentId;
            }

            return videosData[
              index - 1
            ].videoId;
          }
        );

        return;
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        setSelectedVideoId(
          (currentId) => {
            const index =
              videosData.findIndex(
                (item) =>
                  item.videoId ===
                  currentId
              );

            if (
              index < 0 ||
              index >=
                videosData.length -
                  1
            ) {
              return currentId;
            }

            return videosData[
              index + 1
            ].videoId;
          }
        );
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        "";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [selectedVideo]);

  /* ============================================================
     THUMBNAIL
  ============================================================ */

  function getThumbnail(
    videoId: string
  ) {
    return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
  }

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
            {/* LINHA DE IDENTIDADE */}

            <div className="absolute bottom-0 left-0 top-0 w-[4px] bg-[#AF1B1B]" />

            {/* DECORAÇÃO */}

            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#AF1B1B]/[0.045] blur-3xl" />

            <div className="pointer-events-none absolute right-12 top-4 hidden opacity-[0.035] lg:block">
              <GraduationCap
                size={170}
              />
            </div>

            <div className="relative px-5 py-5 sm:px-7 sm:py-6 lg:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">

                {/* TEXTO */}

                <div className="max-w-3xl">
                  <div className="mb-2 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#AF1B1B]" />

                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#AF1B1B] sm:text-[11px]">
                      Capacitação Interna
                    </p>
                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-[#171717] sm:text-3xl">
                    Vídeos de Treinamento
                  </h1>

                  <p className="mt-2 max-w-3xl text-[13px] leading-5 text-gray-500 sm:text-sm sm:leading-6">
                    Acesse conteúdos rápidos e objetivos para aprender
                    procedimentos, esclarecer dúvidas e executar atividades
                    internas com mais segurança.
                  </p>
                </div>

                {/* INDICADORES */}

                <div className="flex gap-5 sm:gap-7">
                  <div>
                    <p className="text-xl font-black leading-none text-[#171717]">
                      {
                        videosData.length
                      }
                    </p>

                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                      Treinamentos
                    </p>
                  </div>

                  <div className="h-10 w-px bg-gray-200" />

                  <div>
                    <p className="text-xl font-black leading-none text-[#171717]">
                      {
                        categories.length -
                        1
                      }
                    </p>

                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                      Categorias
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          {/* =====================================================
              CONTEÚDO
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
              delay: 0.08,
              duration: 0.4,
            }}
            className="mt-5 sm:mt-6"
          >
            {/* TÍTULO */}

            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#AF1B1B]">
                Biblioteca de Treinamentos
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#171717] sm:text-xl">
                Aprenda no seu ritmo
              </h2>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Encontre rapidamente a orientação que precisa.
              </p>
            </div>

            {/* =================================================
                BUSCA + FILTROS
            ================================================= */}

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
              {/* BUSCA */}

              <div className="relative">
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
                  placeholder="Buscar treinamento..."
                  className="
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    bg-[#FAFAFA]
                    pl-10
                    pr-10
                    text-[13px]
                    text-gray-900
                    outline-none
                    transition-all

                    placeholder:text-gray-400

                    focus:border-[#AF1B1B]/40
                    focus:bg-white
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
                    aria-label="Limpar pesquisa"
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-[#AF1B1B]"
                  >
                    <X
                      size={15}
                    />
                  </button>
                )}
              </div>

              {/* FILTROS */}

              <div className="mt-3 flex flex-wrap gap-2">
                {categories.map(
                  (
                    category
                  ) => {
                    const active =
                      selectedCategory ===
                      category;

                    const count =
                      category ===
                      "Todos"
                        ? videosData.length
                        : videosData.filter(
                            (
                              item
                            ) =>
                              item.category ===
                              category
                          ).length;

                    return (
                      <button
                        key={
                          category
                        }
                        type="button"
                        onClick={() =>
                          setSelectedCategory(
                            category
                          )
                        }
                        className={`
                          flex
                          min-h-[34px]
                          items-center
                          gap-2
                          rounded-lg
                          border
                          px-3
                          text-[11px]
                          font-semibold
                          transition-all

                          ${
                            active
                              ? "border-[#AF1B1B] bg-[#AF1B1B] text-white shadow-sm"
                              : "border-gray-200 bg-white text-gray-500 hover:border-[#AF1B1B]/30 hover:bg-[#AF1B1B]/5 hover:text-[#AF1B1B]"
                          }
                        `}
                      >
                        {
                          category
                        }

                        <span
                          className={`
                            flex
                            min-w-[18px]
                            items-center
                            justify-center
                            rounded-full
                            px-1
                            text-[8px]

                            ${
                              active
                                ? "bg-white/20 text-white"
                                : "bg-gray-100 text-gray-400"
                            }
                          `}
                        >
                          {
                            count
                          }
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* RESULTADO */}

            {(searchTerm ||
              selectedCategory !==
                "Todos") && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[11px] text-gray-500">
                  <strong className="font-semibold text-gray-700">
                    {
                      filteredVideos.length
                    }
                  </strong>{" "}
                  {filteredVideos.length ===
                  1
                    ? "treinamento encontrado"
                    : "treinamentos encontrados"}
                </p>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="text-[11px] font-semibold text-[#AF1B1B] hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            )}

            {/* =================================================
                RESULTADOS
            ================================================= */}

            {filteredVideos.length >
            0 ? (
              <>
                {/* ===============================================
                    TREINAMENTO EM DESTAQUE
                =============================================== */}

                {featuredVideo && (
                  <motion.button
                    key={
                      featuredVideo.videoId
                    }
                    type="button"
                    onClick={() =>
                      openVideo(
                        featuredVideo.videoId
                      )
                    }
                    initial={{
                      opacity: 0,
                      y: 12,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="
                      group
                      mt-4
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

                      hover:-translate-y-0.5
                      hover:border-[#AF1B1B]/25
                      hover:shadow-[0_14px_40px_rgba(0,0,0,0.08)]

                      md:grid-cols-[1.15fr_1fr]
                    "
                  >
                    {/* ===========================================
                        THUMBNAIL
                    =========================================== */}

                    <div
                      className="
                        relative
                        min-h-[210px]
                        overflow-hidden
                        bg-[#1A1A1A]

                        sm:min-h-[260px]

                        md:min-h-[300px]
                      "
                      style={{
                        backgroundImage: `url("${getThumbnail(
                          featuredVideo.videoId
                        )}")`,
                        backgroundSize:
                          "cover",
                        backgroundPosition:
                          "center",
                      }}
                    >
                      {/* OVERLAY */}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/5 to-black/10" />

                      {/* DESTAQUE */}

                      <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[9px] font-semibold text-white backdrop-blur-md">
                        <Sparkles
                          size={11}
                        />

                        Em destaque
                      </div>

                      {/* PLAY */}

                      <div className="absolute inset-0 flex items-center justify-center">
                        <div
                          className="
                            flex
                            h-14
                            w-14
                            items-center
                            justify-center
                            rounded-full
                            bg-white
                            text-[#AF1B1B]
                            shadow-2xl
                            transition-all
                            duration-300

                            group-hover:scale-110
                          "
                        >
                          <Play
                            size={22}
                            fill="currentColor"
                            className="ml-1"
                          />
                        </div>
                      </div>

                      <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2 py-1 text-[8px] font-medium text-white backdrop-blur">
                        Vídeo de treinamento
                      </div>
                    </div>

                    {/* ===========================================
                        INFORMAÇÕES
                    =========================================== */}

                    <div className="flex flex-col justify-center p-5 sm:p-6 lg:p-8">
                      <div>
                        <span className="inline-flex rounded-md bg-[#AF1B1B]/8 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-[#AF1B1B]">
                          {
                            featuredVideo.category
                          }
                        </span>

                        <h3 className="mt-3 text-xl font-black leading-tight text-[#171717] sm:text-2xl">
                          {
                            featuredVideo.title
                          }
                        </h3>

                        <p className="mt-3 max-w-xl text-[12px] leading-5 text-gray-500 sm:text-[13px] sm:leading-6">
                          {
                            featuredVideo.description
                          }
                        </p>
                      </div>

                      <div className="mt-6 flex items-center gap-2 text-[11px] font-semibold text-[#AF1B1B]">
                        <PlayCircle
                          size={16}
                        />

                        Assistir treinamento

                        <ArrowRight
                          size={14}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </motion.button>
                )}

                {/* ===============================================
                    OUTROS TREINAMENTOS
                =============================================== */}

                {remainingVideos.length >
                  0 && (
                  <div className="mt-6">
                    <div className="mb-3 flex items-end justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-gray-400">
                          Continue aprendendo
                        </p>

                        <h3 className="mt-0.5 text-sm font-bold text-[#171717]">
                          Outros treinamentos
                        </h3>
                      </div>

                      <p className="text-[10px] text-gray-400">
                        {
                          remainingVideos.length
                        }{" "}
                        disponíveis
                      </p>
                    </div>

                    <motion.div
                      layout
                      className="
                        grid
                        grid-cols-1
                        gap-3

                        md:grid-cols-2

                        xl:grid-cols-3
                      "
                    >
                      <AnimatePresence>
                        {remainingVideos.map(
                          (
                            item,
                            index
                          ) => (
                            <motion.button
                              layout
                              key={
                                item.videoId
                              }
                              type="button"
                              onClick={() =>
                                openVideo(
                                  item.videoId
                                )
                              }
                              initial={{
                                opacity:
                                  0,
                                y: 10,
                                scale:
                                  0.98,
                              }}
                              animate={{
                                opacity:
                                  1,
                                y: 0,
                                scale:
                                  1,
                              }}
                              exit={{
                                opacity:
                                  0,
                                scale:
                                  0.97,
                              }}
                              transition={{
                                delay:
                                  index *
                                  0.04,
                              }}
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
                                duration-200

                                hover:-translate-y-1
                                hover:border-[#AF1B1B]/25
                                hover:shadow-[0_12px_30px_rgba(0,0,0,0.07)]
                              "
                            >
                              {/* THUMBNAIL */}

                              <div
                                className="relative aspect-video overflow-hidden bg-gray-900"
                                style={{
                                  backgroundImage: `url("${getThumbnail(
                                    item.videoId
                                  )}")`,
                                  backgroundSize:
                                    "cover",
                                  backgroundPosition:
                                    "center",
                                }}
                              >
                                <div className="absolute inset-0 bg-black/10 transition-all group-hover:bg-black/25" />

                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div
                                    className="
                                      flex
                                      h-11
                                      w-11
                                      items-center
                                      justify-center
                                      rounded-full
                                      bg-white/95
                                      text-[#AF1B1B]
                                      shadow-lg
                                      transition-all

                                      group-hover:scale-110
                                    "
                                  >
                                    <Play
                                      size={
                                        18
                                      }
                                      fill="currentColor"
                                      className="ml-0.5"
                                    />
                                  </div>
                                </div>

                                <span className="absolute bottom-2 left-2 rounded-md bg-black/55 px-2 py-1 text-[8px] font-semibold text-white backdrop-blur">
                                  {
                                    item.category
                                  }
                                </span>
                              </div>

                              {/* TEXTO */}

                              <div className="p-4">
                                <div className="flex items-start gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#AF1B1B]/8 text-[#AF1B1B]">
                                    {
                                      item.icon
                                    }
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-[13px] font-bold leading-5 text-[#171717]">
                                      {
                                        item.title
                                      }
                                    </h4>

                                    <p className="mt-1.5 line-clamp-2 text-[11px] leading-5 text-gray-500">
                                      {
                                        item.description
                                      }
                                    </p>
                                  </div>

                                  <ArrowRight
                                    size={
                                      14
                                    }
                                    className="mt-1 shrink-0 text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-[#AF1B1B]"
                                  />
                                </div>

                                <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                                  <span className="flex items-center gap-1.5 text-[9px] font-semibold text-gray-400">
                                    <Video
                                      size={
                                        12
                                      }
                                    />

                                    Treinamento
                                  </span>

                                  <span className="text-[9px] font-semibold text-[#AF1B1B]">
                                    Assistir
                                  </span>
                                </div>
                              </div>
                            </motion.button>
                          )
                        )}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                )}
              </>
            ) : (
              /* ===============================================
                 EMPTY STATE
              =============================================== */

              <motion.div
                initial={{
                  opacity: 0,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                className="mt-4 flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <Search
                    size={19}
                  />
                </div>

                <h3 className="mt-3 text-sm font-bold text-gray-900">
                  Nenhum treinamento encontrado
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                  Tente pesquisar outro termo ou selecionar uma categoria
                  diferente.
                </p>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="mt-4 text-xs font-semibold text-[#AF1B1B] hover:underline"
                >
                  Limpar filtros
                </button>
              </motion.div>
            )}
          </motion.section>

          {/* =====================================================
              BLOCO FINAL
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
            className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#AF1B1B]/8 text-[#AF1B1B]">
                <BookOpen
                  size={18}
                />
              </div>

              <div>
                <p className="text-[12px] font-bold text-[#171717]">
                  Capacitação contínua
                </p>

                <p className="mt-1 max-w-3xl text-[11px] leading-5 text-gray-500 sm:text-[12px]">
                  Utilize os treinamentos sempre que precisar revisar um
                  procedimento. Novos conteúdos podem ser adicionados à
                  biblioteca conforme os processos internos evoluírem.
                </p>
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
            MODAL DO VÍDEO
        ===================================================== */}

        <AnimatePresence>
          {selectedVideo && (
            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{
                duration: 0.18,
              }}
              className="
                fixed
                inset-0
                z-[100]
                flex
                items-center
                justify-center
                bg-[#121212]/90
                backdrop-blur-sm

                sm:p-3
              "
              role="dialog"
              aria-modal="true"
              aria-labelledby="training-video-title"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: 18,
                  scale: 0.985,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 8,
                  scale: 0.985,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="
                  flex
                  h-[100dvh]
                  w-full
                  flex-col
                  overflow-hidden
                  bg-[#171717]

                  sm:h-auto
                  sm:max-h-[96vh]
                  sm:max-w-[1250px]
                  sm:rounded-2xl
                  sm:shadow-2xl
                "
              >
                {/* ===============================================
                    HEADER MODAL
                =============================================== */}

                <header
                  className="relative z-20 shrink-0 border-b border-white/10 bg-[#171717]"
                  style={{
                    paddingTop:
                      "env(safe-area-inset-top)",
                  }}
                >
                  <div className="flex min-h-[60px] items-center justify-between gap-3 px-3 sm:px-4">

                    {/* VÍDEO */}

                    <div className="flex min-w-0 items-center gap-3">
                      <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white sm:flex">
                        <PlayCircle
                          size={18}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#E86A6A] sm:text-[9px]">
                          {
                            selectedVideo.category
                          }
                        </p>

                        <h2
                          id="training-video-title"
                          className="max-w-[220px] truncate text-[11px] font-bold text-white sm:max-w-[500px] sm:text-[13px] lg:max-w-[700px]"
                        >
                          {
                            selectedVideo.title
                          }
                        </h2>
                      </div>
                    </div>

                    {/* FECHAR */}

                    <button
                      type="button"
                      onClick={
                        closeVideo
                      }
                      aria-label="Fechar vídeo"
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-white/10
                        text-white/60
                        transition

                        hover:border-[#AF1B1B]
                        hover:bg-[#AF1B1B]
                        hover:text-white
                      "
                    >
                      <X
                        size={17}
                      />
                    </button>
                  </div>
                </header>

                {/* ===============================================
                    PLAYER
                =============================================== */}

                <div className="min-h-0 flex-1 overflow-y-auto bg-black">
                  <div className="mx-auto flex min-h-full w-full max-w-[1200px] flex-col">

                    {/* PLAYER */}

                    <div className="relative w-full bg-black">
                      <div className="w-full overflow-hidden">
                        <YouTubeEmbed
                          key={
                            selectedVideo.videoId
                          }
                          videoid={
                            selectedVideo.videoId
                          }
                          params="rel=0&modestbranding=1"
                          style="max-width: 100%; width: 100%;"
                        />
                      </div>
                    </div>

                    {/* INFORMAÇÕES */}

                    <div className="bg-[#171717] p-4 sm:p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

                        {/* TEXTO */}

                        <div className="max-w-3xl">
                          <span className="inline-flex rounded-md bg-white/10 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-white/60">
                            {
                              selectedVideo.category
                            }
                          </span>

                          <h3 className="mt-2 text-base font-bold text-white sm:text-lg">
                            {
                              selectedVideo.title
                            }
                          </h3>

                          <p className="mt-1.5 text-[11px] leading-5 text-white/50 sm:text-[12px]">
                            {
                              selectedVideo.description
                            }
                          </p>
                        </div>

                        {/* POSIÇÃO */}

                        <div className="shrink-0 rounded-xl bg-white/[0.05] px-3 py-2">
                          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-white/30">
                            Treinamento
                          </p>

                          <p className="mt-0.5 text-xs font-semibold text-white/70">
                            {selectedVideoIndex +
                              1}{" "}
                            de{" "}
                            {
                              videosData.length
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ===============================================
                    NAVEGAÇÃO
                =============================================== */}

                <footer
                  className="relative z-20 shrink-0 border-t border-white/10 bg-[#171717] px-3 py-2.5 sm:px-4"
                  style={{
                    paddingBottom:
                      "max(10px, env(safe-area-inset-bottom))",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">

                    {/* ANTERIOR */}

                    <button
                      type="button"
                      onClick={
                        previousVideo
                      }
                      disabled={
                        selectedVideoIndex <=
                        0
                      }
                      className="
                        flex
                        h-9
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-white/10
                        px-3
                        text-[9px]
                        font-semibold
                        text-white/60
                        transition

                        hover:border-white/20
                        hover:bg-white/[0.05]
                        hover:text-white

                        disabled:cursor-not-allowed
                        disabled:opacity-20
                      "
                    >
                      <ChevronLeft
                        size={14}
                      />

                      <span className="hidden sm:inline">
                        Anterior
                      </span>
                    </button>

                    {/* POSIÇÃO MOBILE */}

                    <div className="flex items-center gap-1.5">
                      {videosData.map(
                        (item) => (
                          <button
                            key={
                              item.videoId
                            }
                            type="button"
                            onClick={() =>
                              openVideo(
                                item.videoId
                              )
                            }
                            aria-label={`Abrir ${item.title}`}
                            className={`
                              h-1.5
                              rounded-full
                              transition-all

                              ${
                                item.videoId ===
                                selectedVideo.videoId
                                  ? "w-6 bg-[#AF1B1B]"
                                  : "w-1.5 bg-white/20 hover:bg-white/40"
                              }
                            `}
                          />
                        )
                      )}
                    </div>

                    {/* PRÓXIMO */}

                    <button
                      type="button"
                      onClick={
                        nextVideo
                      }
                      disabled={
                        selectedVideoIndex >=
                        videosData.length -
                          1
                      }
                      className="
                        flex
                        h-9
                        items-center
                        gap-1.5
                        rounded-lg
                        border
                        border-white/10
                        px-3
                        text-[9px]
                        font-semibold
                        text-white/60
                        transition

                        hover:border-white/20
                        hover:bg-white/[0.05]
                        hover:text-white

                        disabled:cursor-not-allowed
                        disabled:opacity-20
                      "
                    >
                      <span className="hidden sm:inline">
                        Próximo
                      </span>

                      <ChevronRight
                        size={14}
                      />
                    </button>
                  </div>

                  <div className="mt-2 hidden justify-center lg:flex">
                    <p className="text-[8px] text-white/20">
                      ← → navegar • Esc fechar
                    </p>
                  </div>
                </footer>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}