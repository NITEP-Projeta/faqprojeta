"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import { YouTubeEmbed } from "@next/third-parties/google";

import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Layers3,
  Play,
  PlayCircle,
  Search,
  Video,
  X,
} from "lucide-react";

import {
  Document,
  Page,
  pdfjs,
} from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

import { ProtectedRoute } from "@/components/ProtectedRoute";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

/* ============================================================
   TIPOS
============================================================ */

type TrainingCategory =
  | "Recursos Humanos"
  | "Operacional"
  | "Geotécnica";

type CategoryFilter = "Todos" | TrainingCategory;

type ContentFilter =
  | "Todos"
  | "Vídeos"
  | "Materiais";

type TrainingBase = {
  id: string;
  title: string;
  description: string;
  category: TrainingCategory;
  icon: ReactNode;
  tags?: string[];
};

type VideoTraining = TrainingBase & {
  type: "video";
  videoId: string;
};

type PdfTraining = TrainingBase & {
  type: "pdf";
  pdfUrl: string;
  pages?: number;
};

type TrainingItem = VideoTraining | PdfTraining;

/* ============================================================
   DADOS
============================================================ */

const trainings: TrainingItem[] = [
  {
    id: "atestado-medico",
    type: "video",
    title: "Atestado Médico",
    description:
      "Orientações sobre o envio e registro de atestados médicos, incluindo prazos e procedimentos internos.",
    category: "Recursos Humanos",
    videoId: "hSN4PtOcEE4",
    icon: <FileText size={20} />,
    tags: ["atestado", "rh", "saúde", "documentos"],
  },
  {
    id: "banco-de-horas",
    type: "video",
    title: "Inclusão de Saldo no Banco de Horas",
    description:
      "Passo a passo para lançamento e acompanhamento de saldo no banco de horas dentro do sistema.",
    category: "Recursos Humanos",
    videoId: "mqzn2g4_RJk",
    icon: <Clock size={20} />,
    tags: ["banco de horas", "rh", "saldo", "horas"],
  },
  {
    id: "evento-disposicao",
    type: "video",
    title: "Inserção de Evento à Disposição",
    description:
      "Procedimento para registro de eventos à disposição, com orientações sobre preenchimento correto no sistema.",
    category: "Operacional",
    videoId: "6W9yZ60L2kY",
    icon: <ClipboardList size={20} />,
    tags: ["evento", "disposição", "operacional", "registro"],
  },
  {
    id: "operacao-rpa",
    type: "pdf",
    title: "Treinamento para Operação de RPA",
    description:
      "Material técnico sobre fundamentos, regulamentação, planejamento de voo, configuração, segurança e operação prática de RPA.",
    category: "Geotécnica",
    pdfUrl:
      "/pdfs/geotecnica/treinamento-operacao-rpa-topogeo.pdf",
    pages: 58,
    icon: <BookOpen size={20} />,
    tags: [
      "rpa",
      "drone",
      "mavic 3e",
      "matrice 300 rtk",
      "topografia",
      "anac",
      "decea",
      "anatel",
    ],
  },
];

const categoryFilters: CategoryFilter[] = [
  "Todos",
  "Recursos Humanos",
  "Operacional",
  "Geotécnica",
];

const contentFilters: ContentFilter[] = [
  "Todos",
  "Vídeos",
  "Materiais",
];

/* ============================================================
   HELPERS
============================================================ */

function getYouTubeThumbnail(videoId: string) {
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

function matchesContentFilter(
  item: TrainingItem,
  filter: ContentFilter
) {
  if (filter === "Todos") return true;
  if (filter === "Vídeos") return item.type === "video";
  return item.type === "pdf";
}

/* ============================================================
   PÁGINA
============================================================ */

export default function VideosTreinamentoPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("Todos");
  const [selectedContent, setSelectedContent] =
    useState<ContentFilter>("Todos");
  const [selectedTrainingId, setSelectedTrainingId] =
    useState<string | null>(null);

  const [pdfPage, setPdfPage] = useState(1);
  const [pdfTotalPages, setPdfTotalPages] = useState<number | null>(null);
  const [pdfViewerWidth, setPdfViewerWidth] = useState(820);
  const pdfViewerRef = useRef<HTMLDivElement | null>(null);

  const selectedTraining = useMemo(() => {
    return (
      trainings.find(
        (item) => item.id === selectedTrainingId
      ) ?? null
    );
  }, [selectedTrainingId]);

  const filteredTrainings = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return trainings.filter((item) => {
      const categoryMatch =
        selectedCategory === "Todos" ||
        item.category === selectedCategory;

      const contentMatch = matchesContentFilter(
        item,
        selectedContent
      );

      const searchableText = [
        item.title,
        item.description,
        item.category,
        item.type === "video" ? "vídeo video" : "pdf material documento",
        ...(item.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();

      const searchMatch =
        !search || searchableText.includes(search);

      return categoryMatch && contentMatch && searchMatch;
    });
  }, [searchTerm, selectedCategory, selectedContent]);

  const videoCount = useMemo(
    () => trainings.filter((item) => item.type === "video").length,
    []
  );

  const materialCount = useMemo(
    () => trainings.filter((item) => item.type === "pdf").length,
    []
  );

  function openTraining(item: TrainingItem) {
    setSelectedTrainingId(item.id);

    if (item.type === "pdf") {
      setPdfPage(1);
      setPdfTotalPages(item.pages ?? null);
    }
  }

  function closeTraining() {
    setSelectedTrainingId(null);
    setPdfPage(1);
    setPdfTotalPages(null);
  }

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("Todos");
    setSelectedContent("Todos");
  }

  function previousPdfPage() {
    setPdfPage((current) => Math.max(1, current - 1));
  }

  function nextPdfPage() {
    const maxPages =
      pdfTotalPages ??
      (selectedTraining?.type === "pdf"
        ? selectedTraining.pages ?? 1
        : 1);

    setPdfPage((current) =>
      Math.min(maxPages, current + 1)
    );
  }

  /* ============================================================
     MODAL + TECLADO
  ============================================================ */

  useEffect(() => {
    if (!selectedTraining) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeTraining();
        return;
      }

      if (selectedTraining.type !== "pdf") {
        return;
      }

      if (event.key === "ArrowLeft") {
        setPdfPage((current) => Math.max(1, current - 1));
      }

      if (event.key === "ArrowRight") {
        const maxPages =
          pdfTotalPages ?? selectedTraining.pages ?? 1;

        setPdfPage((current) =>
          Math.min(maxPages, current + 1)
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedTraining, pdfTotalPages]);

  /* ============================================================
     LARGURA RESPONSIVA DO PDF
  ============================================================ */

  useEffect(() => {
    if (
      !selectedTraining ||
      selectedTraining.type !== "pdf" ||
      !pdfViewerRef.current
    ) {
      return;
    }

    const element = pdfViewerRef.current;

    const updateWidth = () => {
      const width = Math.max(
        280,
        Math.min(element.clientWidth - 32, 1050)
      );
      setPdfViewerWidth(width);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, [selectedTraining]);

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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
          >
            <div className="absolute bottom-0 left-0 top-0 w-[4px] bg-[#AF1B1B]" />
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#AF1B1B]/[0.045] blur-3xl" />
            <div className="pointer-events-none absolute right-12 top-4 hidden opacity-[0.035] lg:block">
              <GraduationCap size={170} />
            </div>

            <div className="relative px-5 py-5 sm:px-7 sm:py-6 lg:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-2 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-[#AF1B1B]" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#AF1B1B] sm:text-[11px]">
                      Capacitação Interna
                    </p>
                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-[#171717] sm:text-3xl">
                    Central de Treinamentos
                  </h1>

                  <p className="mt-2 max-w-3xl text-[13px] leading-5 text-gray-500 sm:text-sm sm:leading-6">
                    Vídeos, materiais técnicos e documentos de apoio reunidos em um só lugar para consulta e capacitação contínua.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <p className="text-xl font-black leading-none text-[#171717]">
                      {trainings.length}
                    </p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                      Conteúdos
                    </p>
                  </div>

                  <div className="border-l border-gray-200 pl-4 sm:pl-6">
                    <p className="text-xl font-black leading-none text-[#171717]">
                      {videoCount}
                    </p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                      Vídeos
                    </p>
                  </div>

                  <div className="border-l border-gray-200 pl-4 sm:pl-6">
                    <p className="text-xl font-black leading-none text-[#171717]">
                      {materialCount}
                    </p>
                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                      Materiais
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.4 }}
            className="mt-5 sm:mt-6"
          >
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#AF1B1B]">
                Biblioteca de Conhecimento
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#171717] sm:text-xl">
                Encontre o treinamento que precisa
              </h2>

              <p className="mt-1 text-xs leading-5 text-gray-500">
                Pesquise por tema, área ou formato do conteúdo.
              </p>
            </div>

            {/* =================================================
                BUSCA + FILTROS
            ================================================= */}

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) =>
                    setSearchTerm(event.target.value)
                  }
                  placeholder="Buscar treinamento, tema, área ou palavra-chave..."
                  className="h-11 w-full rounded-xl border border-gray-200 bg-[#FAFAFA] pl-10 pr-10 text-[13px] text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-[#AF1B1B]/40 focus:bg-white focus:ring-4 focus:ring-[#AF1B1B]/5"
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    aria-label="Limpar pesquisa"
                    className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-[#AF1B1B]"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-gray-400">
                    Formato
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {contentFilters.map((filter) => {
                      const active = selectedContent === filter;

                      const count =
                        filter === "Todos"
                          ? trainings.length
                          : filter === "Vídeos"
                            ? videoCount
                            : materialCount;

                      return (
                        <button
                          key={filter}
                          type="button"
                          onClick={() => setSelectedContent(filter)}
                          className={`flex min-h-[34px] items-center gap-2 rounded-lg border px-3 text-[11px] font-semibold transition-all ${
                            active
                              ? "border-[#AF1B1B] bg-[#AF1B1B] text-white shadow-sm"
                              : "border-gray-200 bg-white text-gray-500 hover:border-[#AF1B1B]/30 hover:bg-[#AF1B1B]/5 hover:text-[#AF1B1B]"
                          }`}
                        >
                          {filter}
                          <span
                            className={`flex min-w-[18px] items-center justify-center rounded-full px-1 text-[8px] ${
                              active
                                ? "bg-white/20 text-white"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.12em] text-gray-400">
                    Área
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {categoryFilters.map((category) => {
                      const active = selectedCategory === category;

                      const count =
                        category === "Todos"
                          ? trainings.length
                          : trainings.filter(
                              (item) => item.category === category
                            ).length;

                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => setSelectedCategory(category)}
                          className={`flex min-h-[34px] items-center gap-2 rounded-lg border px-3 text-[11px] font-semibold transition-all ${
                            active
                              ? "border-[#AF1B1B] bg-[#AF1B1B] text-white shadow-sm"
                              : "border-gray-200 bg-white text-gray-500 hover:border-[#AF1B1B]/30 hover:bg-[#AF1B1B]/5 hover:text-[#AF1B1B]"
                          }`}
                        >
                          {category}
                          <span
                            className={`flex min-w-[18px] items-center justify-center rounded-full px-1 text-[8px] ${
                              active
                                ? "bg-white/20 text-white"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {(searchTerm ||
              selectedCategory !== "Todos" ||
              selectedContent !== "Todos") && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[11px] text-gray-500">
                  <strong className="font-semibold text-gray-700">
                    {filteredTrainings.length}
                  </strong>{" "}
                  {filteredTrainings.length === 1
                    ? "conteúdo encontrado"
                    : "conteúdos encontrados"}
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-[11px] font-semibold text-[#AF1B1B] hover:underline"
                >
                  Limpar filtros
                </button>
              </div>
            )}

            {/* =================================================
                GRID
            ================================================= */}

            {filteredTrainings.length > 0 ? (
              <motion.div
                layout
                className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
              >
                <AnimatePresence>
                  {filteredTrainings.map((item, index) => (
                    <motion.button
                      layout
                      key={item.id}
                      type="button"
                      onClick={() => openTraining(item)}
                      initial={{ opacity: 0, y: 10, scale: 0.985 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ delay: index * 0.035 }}
                      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-[#AF1B1B]/25 hover:shadow-[0_12px_30px_rgba(0,0,0,0.07)]"
                    >
                      {item.type === "video" ? (
                        <div
                          className="relative aspect-video overflow-hidden bg-gray-900"
                          style={{
                            backgroundImage: `url("${getYouTubeThumbnail(
                              item.videoId
                            )}")`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          <div className="absolute inset-0 bg-black/10 transition-all group-hover:bg-black/25" />

                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-[#AF1B1B] shadow-lg transition-all group-hover:scale-110">
                              <Play
                                size={19}
                                fill="currentColor"
                                className="ml-0.5"
                              />
                            </div>
                          </div>

                          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-white backdrop-blur">
                            <Video size={11} />
                            Vídeo
                          </span>
                        </div>
                      ) : (
                        <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-[#171717]">
                          <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-[#AF1B1B]/20 blur-3xl" />
                          <div className="absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/[0.04] blur-3xl" />

                          <div className="relative flex flex-col items-center text-center">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-white shadow-xl">
                              <FileText size={28} />
                            </div>

                            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/50">
                              Material técnico
                            </p>
                          </div>

                          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-[#AF1B1B] px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-white">
                            <FileText size={11} />
                            PDF
                          </span>

                          {item.pages && (
                            <span className="absolute bottom-3 right-3 rounded-md bg-white/10 px-2 py-1 text-[8px] font-semibold text-white/65 backdrop-blur">
                              {item.pages} páginas
                            </span>
                          )}
                        </div>
                      )}

                      <div className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#AF1B1B]/8 text-[#AF1B1B]">
                            {item.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="mb-1.5 flex flex-wrap items-center gap-2">
                              <span className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.07em] text-gray-500">
                                {item.category}
                              </span>
                            </div>

                            <h3 className="text-[14px] font-bold leading-5 text-[#171717]">
                              {item.title}
                            </h3>

                            <p className="mt-1.5 line-clamp-3 text-[11px] leading-5 text-gray-500">
                              {item.description}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                          <span className="flex items-center gap-1.5 text-[9px] font-semibold text-gray-400">
                            {item.type === "video" ? (
                              <Video size={12} />
                            ) : (
                              <BookOpen size={12} />
                            )}

                            {item.type === "video"
                              ? "Treinamento em vídeo"
                              : "Material de treinamento"}
                          </span>

                          <span className="flex items-center gap-1 text-[9px] font-semibold text-[#AF1B1B]">
                            {item.type === "video"
                              ? "Assistir"
                              : "Abrir material"}
                            <ArrowRight
                              size={12}
                              className="transition-transform group-hover:translate-x-1"
                            />
                          </span>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                  <Search size={19} />
                </div>

                <h3 className="mt-3 text-sm font-bold text-gray-900">
                  Nenhum treinamento encontrado
                </h3>

                <p className="mt-1 max-w-sm text-xs leading-5 text-gray-500">
                  Tente pesquisar outro termo ou alterar os filtros de formato e área.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#AF1B1B]/8 text-[#AF1B1B]">
                <Layers3 size={18} />
              </div>

              <div>
                <p className="text-[12px] font-bold text-[#171717]">
                  Conhecimento centralizado
                </p>

                <p className="mt-1 max-w-3xl text-[11px] leading-5 text-gray-500 sm:text-[12px]">
                  A central pode receber novos vídeos e materiais técnicos conforme os processos internos evoluírem, mantendo os treinamentos organizados por área e formato.
                </p>
              </div>
            </div>
          </motion.section>

          <footer
            className="py-6 text-center text-[10px] text-gray-400 sm:text-[11px]"
            suppressHydrationWarning
          >
            © {new Date().getFullYear()} Projeta • Sistema Interno Corporativo
          </footer>
        </div>

        {/* =====================================================
            MODAL
        ===================================================== */}

        <AnimatePresence>
          {selectedTraining && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-[#121212]/90 backdrop-blur-sm sm:p-3"
              role="dialog"
              aria-modal="true"
              aria-labelledby="training-modal-title"
            >
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.985 }}
                transition={{ duration: 0.25 }}
                className="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#171717] sm:h-auto sm:max-h-[96vh] sm:max-w-[1250px] sm:rounded-2xl sm:shadow-2xl"
              >
                {/* HEADER */}

                <header
                  className="relative z-20 shrink-0 border-b border-white/10 bg-[#171717]"
                  style={{
                    paddingTop: "env(safe-area-inset-top)",
                  }}
                >
                  <div className="flex min-h-[62px] items-center justify-between gap-3 px-3 sm:px-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white sm:flex">
                        {selectedTraining.type === "video" ? (
                          <PlayCircle size={18} />
                        ) : (
                          <BookOpen size={18} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#E86A6A] sm:text-[9px]">
                            {selectedTraining.category}
                          </p>

                          <span className="h-1 w-1 rounded-full bg-white/20" />

                          <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-white/35 sm:text-[9px]">
                            {selectedTraining.type === "video"
                              ? "Vídeo"
                              : "Material PDF"}
                          </p>
                        </div>

                        <h2
                          id="training-modal-title"
                          className="max-w-[230px] truncate text-[11px] font-bold text-white sm:max-w-[520px] sm:text-[13px] lg:max-w-[760px]"
                        >
                          {selectedTraining.title}
                        </h2>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedTraining.type === "pdf" && (
                        <>
                          <a
                            href={selectedTraining.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="hidden h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[9px] font-semibold text-white/60 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white sm:flex"
                          >
                            <ExternalLink size={13} />
                            Abrir em nova aba
                          </a>

                          <a
                            href={selectedTraining.pdfUrl}
                            download
                            className="hidden h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[9px] font-semibold text-white/60 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white md:flex"
                          >
                            <Download size={13} />
                            Baixar
                          </a>
                        </>
                      )}

                      <button
                        type="button"
                        onClick={closeTraining}
                        aria-label="Fechar treinamento"
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-white/60 transition hover:border-[#AF1B1B] hover:bg-[#AF1B1B] hover:text-white"
                      >
                        <X size={17} />
                      </button>
                    </div>
                  </div>
                </header>

                {/* CONTEÚDO */}

                {selectedTraining.type === "video" ? (
                  <div className="min-h-0 flex-1 overflow-y-auto bg-black">
                    <div className="mx-auto flex min-h-full w-full max-w-[1200px] flex-col">
                      <div className="relative w-full bg-black">
                        <div className="w-full overflow-hidden">
                          <YouTubeEmbed
                            key={selectedTraining.videoId}
                            videoid={selectedTraining.videoId}
                            params="rel=0&modestbranding=1"
                            style="max-width: 100%; width: 100%;"
                          />
                        </div>
                      </div>

                      <div className="bg-[#171717] p-4 sm:p-5">
                        <span className="inline-flex rounded-md bg-white/10 px-2 py-1 text-[8px] font-bold uppercase tracking-[0.08em] text-white/60">
                          {selectedTraining.category}
                        </span>

                        <h3 className="mt-2 text-base font-bold text-white sm:text-lg">
                          {selectedTraining.title}
                        </h3>

                        <p className="mt-1.5 max-w-3xl text-[11px] leading-5 text-white/50 sm:text-[12px]">
                          {selectedTraining.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-h-0 flex-1 flex-col bg-[#0F0F0F]">
                    <div
                      ref={pdfViewerRef}
                      className="min-h-0 flex-1 overflow-auto bg-[#2A2A2A] p-3 sm:p-5"
                    >
                      <div className="mx-auto flex min-h-full w-full items-start justify-center">
                        <Document
                          file={selectedTraining.pdfUrl}
                          onLoadSuccess={({ numPages }) => {
                            setPdfTotalPages(numPages);
                            setPdfPage((current) =>
                              Math.min(current, numPages)
                            );
                          }}
                          loading={
                            <div className="flex min-h-[420px] items-center justify-center text-sm text-white/50">
                              Carregando material...
                            </div>
                          }
                          error={
                            <div className="flex min-h-[420px] flex-col items-center justify-center gap-2 text-center text-sm text-white/50">
                              <FileText size={28} />
                              <p>Não foi possível carregar o PDF.</p>
                              <a
                                href={selectedTraining.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[#E86A6A] hover:underline"
                              >
                                Abrir o arquivo em nova aba
                              </a>
                            </div>
                          }
                        >
                          <div className="overflow-hidden rounded-lg bg-white shadow-2xl">
                            <Page
                              pageNumber={pdfPage}
                              width={pdfViewerWidth}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              loading={
                                <div className="flex min-h-[500px] items-center justify-center bg-white text-sm text-gray-400">
                                  Carregando página...
                                </div>
                              }
                            />
                          </div>
                        </Document>
                      </div>
                    </div>

                    <div className="shrink-0 border-t border-white/10 bg-[#171717] px-3 py-2.5 sm:px-4">
                      <div className="flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={previousPdfPage}
                          disabled={pdfPage <= 1}
                          className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[9px] font-semibold text-white/60 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                        >
                          <ChevronLeft size={14} />
                          <span className="hidden sm:inline">Anterior</span>
                        </button>

                        <div className="flex items-center gap-3">
                          <div className="rounded-lg bg-white/[0.05] px-3 py-2 text-center">
                            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-white/30">
                              Página
                            </p>
                            <p className="mt-0.5 text-xs font-semibold text-white/70">
                              {pdfPage} de {pdfTotalPages ?? selectedTraining.pages ?? "—"}
                            </p>
                          </div>

                          <div className="hidden sm:block">
                            <p className="max-w-[420px] truncate text-[10px] font-semibold text-white/55">
                              {selectedTraining.title}
                            </p>
                            <p className="mt-0.5 text-[8px] text-white/25">
                              Use ← → para navegar • Esc para fechar
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={nextPdfPage}
                          disabled={
                            pdfPage >=
                            (pdfTotalPages ?? selectedTraining.pages ?? 1)
                          }
                          className="flex h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-[9px] font-semibold text-white/60 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                        >
                          <span className="hidden sm:inline">Próxima</span>
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* FOOTER MOBILE / AÇÕES PDF */}

                {selectedTraining.type === "pdf" && (
                  <div
                    className="flex shrink-0 items-center gap-2 border-t border-white/10 bg-[#171717] px-3 py-2 sm:hidden"
                    style={{
                      paddingBottom:
                        "max(8px, env(safe-area-inset-bottom))",
                    }}
                  >
                    <a
                      href={selectedTraining.pdfUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-white/10 text-[9px] font-semibold text-white/65"
                    >
                      <ExternalLink size={13} />
                      Nova aba
                    </a>

                    <a
                      href={selectedTraining.pdfUrl}
                      download
                      className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#AF1B1B] text-[9px] font-semibold text-white"
                    >
                      <Download size={13} />
                      Baixar
                    </a>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}
