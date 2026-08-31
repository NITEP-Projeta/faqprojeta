"use client";

import {
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  FiArrowRight,
  FiBox,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiClipboard,
  FiCreditCard,
  FiExternalLink,
  FiGitBranch,
  FiLayers,
  FiMaximize,
  FiMinus,
  FiPlus,
  FiSearch,
  FiSmile,
  FiTruck,
  FiUserCheck,
  FiUserPlus,
  FiX,
  FiZoomIn,
} from "react-icons/fi";

import {
  Document,
  Page,
  pdfjs,
} from "react-pdf";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

import { ProtectedRoute } from "@/components/ProtectedRoute";

/* ============================================================
   PDF WORKER
============================================================ */

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

/* ============================================================
   TIPOS
============================================================ */

type SipocCategory =
  | "Todos"
  | "Pessoas"
  | "Financeiro"
  | "Operações"
  | "Planejamento"
  | "Qualidade"
  | "Estrutura";

type ItemCategory = Exclude<
  SipocCategory,
  "Todos"
>;

type SipocItem = {
  title: string;
  description: string;
  slug: string;
  category: ItemCategory;
  icon: ReactNode;
};

type FitMode =
  | "page"
  | "width"
  | "custom";

type PageSize = {
  width: number;
  height: number;
};

type ViewerSize = {
  width: number;
  height: number;
};

type PdfPageLike = {
  getViewport: (options: {
    scale: number;
  }) => {
    width: number;
    height: number;
  };
};

/* ============================================================
   CATEGORIAS
============================================================ */

const categories: SipocCategory[] = [
  "Todos",
  "Pessoas",
  "Financeiro",
  "Operações",
  "Planejamento",
  "Qualidade",
  "Estrutura",
];

/* ============================================================
   DOCUMENTOS
============================================================ */

const sipocData: SipocItem[] = [
  {
    title:
      "Processo de Contratação de Capital Intelectual",
    description:
      "Atrai e seleciona profissionais qualificados alinhados aos objetivos estratégicos da empresa.",
    slug:
      "sipoc/processo_de_contratacao_de_capital_intelectual",
    category: "Pessoas",
    icon: <FiUserCheck size={21} />,
  },
  {
    title:
      "Processo de Admissão de Pessoas",
    description:
      "Gerencia a entrada de novos colaboradores, garantindo conformidade legal e integração à empresa.",
    slug:
      "sipoc/processo_de_admissao_de_pessoas",
    category: "Pessoas",
    icon: <FiUserPlus size={21} />,
  },
  {
    title:
      "Processo de Mobilização de Pessoas",
    description:
      "Planeja e executa o envio de colaboradores para projetos, assegurando requisitos logísticos e de segurança.",
    slug:
      "sipoc/processo_de_mobilizacao_de_pessoas",
    category: "Pessoas",
    icon: <FiTruck size={21} />,
  },
  {
    title:
      "SIPOC de Despesas Reembolsáveis",
    description:
      "Padroniza o fluxo de solicitação, aprovação e pagamento de reembolsos corporativos.",
    slug:
      "despesas/SIPOC Despesas reembolsáveis",
    category: "Financeiro",
    icon: <FiCreditCard size={21} />,
  },
  {
    title: "SIPOC de Geotecnia",
    description:
      "Mapeia os processos de análise de solo e viabilidade técnica aplicados às atividades geotécnicas.",
    slug:
      "geotecnica/SIPOC Geotecnica",
    category: "Operações",
    icon: <FiLayers size={21} />,
  },
  {
    title:
      "SIPOC de Inventário",
    description:
      "Gerencia o fluxo físico e sistêmico para controle dos bens, materiais e ativos da empresa.",
    slug:
      "inventario/SIPOC de Inventário",
    category: "Operações",
    icon: <FiBox size={21} />,
  },
  {
    title:
      "SIPOC de Medição Geral",
    description:
      "Estrutura o acompanhamento, validação e faturamento dos serviços executados.",
    slug:
      "medicao/SIPOC Medição Geral",
    category: "Operações",
    icon: <FiClipboard size={21} />,
  },
  {
    title:
      "SIPOC de Planejamento",
    description:
      "Estabelece cronogramas, metas e recursos necessários para execução e acompanhamento dos projetos.",
    slug:
      "planejamento/SIPOC Planejamento",
    category: "Planejamento",
    icon: <FiCalendar size={21} />,
  },
  {
    title:
      "SIPOC Pesquisa de Satisfação do Cliente",
    description:
      "Avalia a percepção dos clientes e capta feedbacks para apoiar a melhoria contínua.",
    slug:
      "psc/SIPOC PSC",
    category: "Qualidade",
    icon: <FiSmile size={21} />,
  },
  {
    title:
      "Organograma Master",
    description:
      "Apresenta a estrutura organizacional e o macroambiente executivo da Projeta.",
    slug:
      "sipoc/organograma",
    category: "Estrutura",
    icon: <FiGitBranch size={21} />,
  },
];

/* ============================================================
   PÁGINA
============================================================ */

export default function SipocPage() {
  const [
    selectedItem,
    setSelectedItem,
  ] = useState<SipocItem | null>(
    null
  );

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<SipocCategory>("Todos");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    numPages,
    setNumPages,
  ] = useState(0);

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1);

  const [
    pageSize,
    setPageSize,
  ] = useState<PageSize>({
    width: 842,
    height: 595,
  });

  const [
    viewerSize,
    setViewerSize,
  ] = useState<ViewerSize>({
    width: 1000,
    height: 700,
  });

  const [
    fitMode,
    setFitMode,
  ] =
    useState<FitMode>("page");

  const [zoom, setZoom] =
    useState(1);

  const [
    isPdfLoading,
    setIsPdfLoading,
  ] = useState(false);

  const [
    isMobile,
    setIsMobile,
  ] = useState(false);

  const viewerRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const touchStartX =
    useRef<number | null>(null);

  const touchStartY =
    useRef<number | null>(null);

  /* ============================================================
     DEVICE
  ============================================================ */

  useEffect(() => {
    const updateDevice = () => {
      setIsMobile(
        window.innerWidth < 768
      );
    };

    updateDevice();

    window.addEventListener(
      "resize",
      updateDevice
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateDevice
      );
    };
  }, []);

  /* ============================================================
     FILTROS
  ============================================================ */

  const filteredItems =
    useMemo(() => {
      const search =
        searchTerm
          .trim()
          .toLowerCase();

      return sipocData.filter(
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
      selectedCategory,
      searchTerm,
    ]);

  function clearFilters() {
    setSearchTerm("");

    setSelectedCategory(
      "Todos"
    );
  }

  /* ============================================================
     PDF URL
  ============================================================ */

  const selectedPdfUrl =
    selectedItem
      ? encodeURI(
          `/pdfs/${selectedItem.slug}.pdf`
        )
      : "";

  /* ============================================================
     ABRIR DOCUMENTO
  ============================================================ */

  function openDocument(
    item: SipocItem
  ) {
    const mobile =
      window.innerWidth < 768;

    setSelectedItem(item);

    setCurrentPage(1);

    setNumPages(0);

    setZoom(1);

    setFitMode(
      mobile
        ? "width"
        : "page"
    );

    setIsPdfLoading(true);
  }

  /* ============================================================
     FECHAR DOCUMENTO
  ============================================================ */

  function closeDocument() {
    setSelectedItem(null);

    setCurrentPage(1);

    setNumPages(0);

    setZoom(1);

    setFitMode("page");

    setIsPdfLoading(false);

    touchStartX.current = null;
    touchStartY.current = null;
  }

  /* ============================================================
     TAMANHO DO VIEWER
  ============================================================ */

  useEffect(() => {
    if (!selectedItem) {
      return;
    }

    const updateViewerSize =
      () => {
        if (
          !viewerRef.current
        ) {
          return;
        }

        setViewerSize({
          width:
            viewerRef.current
              .clientWidth,

          height:
            viewerRef.current
              .clientHeight,
        });
      };

    updateViewerSize();

    const observer =
      new ResizeObserver(
        updateViewerSize
      );

    if (viewerRef.current) {
      observer.observe(
        viewerRef.current
      );
    }

    window.addEventListener(
      "resize",
      updateViewerSize
    );

    window.addEventListener(
      "orientationchange",
      updateViewerSize
    );

    return () => {
      observer.disconnect();

      window.removeEventListener(
        "resize",
        updateViewerSize
      );

      window.removeEventListener(
        "orientationchange",
        updateViewerSize
      );
    };
  }, [selectedItem]);

  /* ============================================================
     ESCALA AUTOMÁTICA
  ============================================================ */

  const automaticScale =
    useMemo(() => {
      if (
        !pageSize.width ||
        !pageSize.height
      ) {
        return 1;
      }

      const horizontalPadding =
        isMobile
          ? 16
          : 48;

      const verticalPadding =
        isMobile
          ? 16
          : 48;

      const availableWidth =
        Math.max(
          viewerSize.width -
            horizontalPadding,
          220
        );

      const availableHeight =
        Math.max(
          viewerSize.height -
            verticalPadding,
          220
        );

      const widthScale =
        availableWidth /
        pageSize.width;

      const heightScale =
        availableHeight /
        pageSize.height;

      if (
        fitMode === "width"
      ) {
        return Math.min(
          widthScale,
          2
        );
      }

      if (
        fitMode === "page"
      ) {
        return Math.min(
          widthScale,
          heightScale,
          2
        );
      }

      return zoom;
    }, [
      fitMode,
      isMobile,
      pageSize,
      viewerSize,
      zoom,
    ]);

  const finalScale =
    fitMode === "custom"
      ? zoom
      : automaticScale;

  const zoomPercentage =
    Math.round(
      finalScale * 100
    );

  /* ============================================================
     PAGE LOAD
  ============================================================ */

  function handlePageLoad(
    page: PdfPageLike
  ) {
    const viewport =
      page.getViewport({
        scale: 1,
      });

    setPageSize({
      width: viewport.width,
      height: viewport.height,
    });

    setIsPdfLoading(false);
  }

  /* ============================================================
     NAVEGAÇÃO
  ============================================================ */

  function previousPage() {
    setCurrentPage(
      (current) => {
        if (current <= 1) {
          return current;
        }

        setIsPdfLoading(true);

        return current - 1;
      }
    );
  }

  function nextPage() {
    setCurrentPage(
      (current) => {
        if (
          !numPages ||
          current >= numPages
        ) {
          return current;
        }

        setIsPdfLoading(true);

        return current + 1;
      }
    );
  }

  /* ============================================================
     ZOOM
  ============================================================ */

  function increaseZoom() {
    const currentScale =
      finalScale;

    setFitMode("custom");

    setZoom(
      Math.min(
        currentScale + 0.1,
        2.5
      )
    );
  }

  function decreaseZoom() {
    const currentScale =
      finalScale;

    setFitMode("custom");

    setZoom(
      Math.max(
        currentScale - 0.1,
        0.4
      )
    );
  }

  function resetZoom() {
    setZoom(1);

    setFitMode(
      isMobile
        ? "width"
        : "page"
    );
  }

  /* ============================================================
     SWIPE MOBILE
  ============================================================ */

  function handleTouchStart(
    event: React.TouchEvent<HTMLDivElement>
  ) {
    if (
      event.touches.length !== 1
    ) {
      return;
    }

    touchStartX.current =
      event.touches[0].clientX;

    touchStartY.current =
      event.touches[0].clientY;
  }

  function handleTouchEnd(
    event: React.TouchEvent<HTMLDivElement>
  ) {
    /*
     * Quando o usuário está usando zoom
     * manual, o swipe fica desativado para
     * permitir arrastar o PDF livremente.
     */
    if (
      fitMode === "custom"
    ) {
      touchStartX.current = null;
      touchStartY.current = null;

      return;
    }

    if (
      touchStartX.current ===
        null ||
      touchStartY.current ===
        null
    ) {
      return;
    }

    const endX =
      event.changedTouches[0]
        .clientX;

    const endY =
      event.changedTouches[0]
        .clientY;

    const diffX =
      endX -
      touchStartX.current;

    const diffY =
      endY -
      touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    /*
     * Movimento precisa ser
     * predominantemente horizontal.
     */
    if (
      Math.abs(diffX) < 70 ||
      Math.abs(diffX) <=
        Math.abs(diffY)
    ) {
      return;
    }

    if (diffX < 0) {
      nextPage();
    } else {
      previousPage();
    }
  }

  /* ============================================================
     BODY + TECLADO
  ============================================================ */

  useEffect(() => {
    if (!selectedItem) {
      document.body.style.overflow =
        "";

      return;
    }

    document.body.style.overflow =
      "hidden";

    const handleKeyboard = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape"
      ) {
        closeDocument();

        return;
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        setCurrentPage(
          (current) => {
            if (current <= 1) {
              return current;
            }

            setIsPdfLoading(true);

            return current - 1;
          }
        );

        return;
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        setCurrentPage(
          (current) => {
            if (
              current >= numPages
            ) {
              return current;
            }

            setIsPdfLoading(true);

            return current + 1;
          }
        );

        return;
      }

      if (
        event.key === "+" ||
        event.key === "="
      ) {
        increaseZoom();

        return;
      }

      if (
        event.key === "-"
      ) {
        decreaseZoom();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () => {
      document.body.style.overflow =
        "";

      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  }, [
    selectedItem,
    numPages,
    finalScale,
  ]);

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
            <div className="absolute bottom-0 left-0 top-0 w-[4px] bg-[#AF1B1B]" />

            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#AF1B1B]/[0.035] blur-3xl" />

            <div className="relative px-5 py-5 sm:px-7 sm:py-6 lg:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-2 flex items-center gap-2">
                    <FiGitBranch className="text-[#AF1B1B]" />

                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#AF1B1B] sm:text-[11px]">
                      Biblioteca de Processos
                    </p>
                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-[#171717] sm:text-3xl">
                    SIPOC & Organograma
                  </h1>

                  <p className="mt-2 max-w-3xl text-[13px] leading-5 text-gray-500 sm:text-sm sm:leading-6">
                    Visualize os principais processos da Projeta, entenda suas
                    etapas, responsabilidades e relações entre áreas.
                  </p>
                </div>

                <div className="flex gap-5 sm:gap-7">
                  <div>
                    <p className="text-xl font-black text-[#171717]">
                      {
                        sipocData.length
                      }
                    </p>

                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                      Mapas
                    </p>
                  </div>

                  <div className="h-10 w-px bg-gray-200" />

                  <div>
                    <p className="text-xl font-black text-[#171717]">
                      {
                        categories.length -
                        1
                      }
                    </p>

                    <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                      Áreas
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          {/* =====================================================
              PROCESSOS
          ===================================================== */}

          <section className="mt-5 sm:mt-6">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#AF1B1B]">
              Processos Corporativos
            </p>

            <h2 className="mt-1 text-lg font-bold text-[#171717] sm:text-xl">
              Mapas disponíveis
            </h2>

            <p className="mt-1 text-xs text-gray-500">
              Pesquise ou filtre os processos por área.
            </p>

            {/* =================================================
                BUSCA E FILTROS
            ================================================= */}

            <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
              <div className="relative">
                <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-gray-400" />

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
                  placeholder="Buscar processo, área ou SIPOC..."
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
                    transition

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
                    <FiX
                      size={15}
                    />
                  </button>
                )}
              </div>

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
                        ? sipocData.length
                        : sipocData.filter(
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
                          {count}
                        </span>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* =================================================
                RESULTADO
            ================================================= */}

            {(searchTerm ||
              selectedCategory !==
                "Todos") && (
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="text-[11px] text-gray-500">
                  <strong className="font-semibold text-gray-700">
                    {
                      filteredItems.length
                    }
                  </strong>{" "}
                  {filteredItems.length ===
                  1
                    ? "processo encontrado"
                    : "processos encontrados"}
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
                GRID
            ================================================= */}

            {filteredItems.length >
            0 ? (
              <motion.div
                layout
                className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
              >
                <AnimatePresence>
                  {filteredItems.map(
                    (
                      item,
                      index
                    ) => (
                      <motion.button
                        layout
                        key={
                          item.slug
                        }
                        type="button"
                        initial={{
                          opacity: 0,
                          y: 10,
                          scale: 0.98,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          scale: 1,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.97,
                        }}
                        transition={{
                          duration:
                            0.25,
                          delay:
                            index *
                            0.025,
                        }}
                        onClick={() =>
                          openDocument(
                            item
                          )
                        }
                        className="
                          group
                          relative
                          flex
                          min-h-[165px]
                          w-full
                          cursor-pointer
                          flex-col
                          overflow-hidden
                          rounded-2xl
                          border
                          border-gray-200
                          bg-white
                          p-4
                          text-left
                          shadow-sm
                          transition-all
                          duration-200

                          hover:-translate-y-1
                          hover:border-[#AF1B1B]/25
                          hover:shadow-[0_12px_35px_rgba(0,0,0,0.07)]

                          active:scale-[0.99]

                          sm:p-5
                        "
                      >
                        <span className="absolute left-0 top-0 h-[3px] w-0 bg-[#AF1B1B] transition-all duration-300 group-hover:w-full" />

                        <div className="flex items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#AF1B1B]/8 text-[#AF1B1B] transition-all group-hover:scale-105 group-hover:bg-[#AF1B1B]/12">
                            {
                              item.icon
                            }
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="text-[14px] font-bold leading-5 text-[#171717] sm:text-[15px]">
                              {
                                item.title
                              }
                            </h3>

                            <p className="mt-1.5 text-[11px] leading-[18px] text-gray-500 sm:text-[12px] sm:leading-5">
                              {
                                item.description
                              }
                            </p>
                          </div>

                          <FiArrowRight className="mt-1 shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-[#AF1B1B]" />
                        </div>

                        <div className="mt-auto pt-4">
                          <span className="inline-flex rounded-md bg-gray-100 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.08em] text-gray-500 transition group-hover:bg-[#AF1B1B]/8 group-hover:text-[#AF1B1B]">
                            {
                              item.category
                            }
                          </span>
                        </div>
                      </motion.button>
                    )
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="mt-4 flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
                  <FiSearch className="text-gray-400" />
                </div>

                <h3 className="mt-3 text-sm font-bold text-gray-900">
                  Nenhum processo encontrado
                </h3>

                <p className="mt-1 text-xs text-gray-500">
                  Tente outro termo ou uma categoria diferente.
                </p>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="mt-3 text-xs font-semibold text-[#AF1B1B]"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </section>

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
            VISUALIZADOR PDF
        ===================================================== */}

        <AnimatePresence>
          {selectedItem && (
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
                bg-[#171717]/90
                backdrop-blur-sm

                sm:p-3
              "
              role="dialog"
              aria-modal="true"
              aria-labelledby="sipoc-document-title"
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
                  bg-[#DCDDDF]

                  sm:h-[96vh]
                  sm:max-w-[1600px]
                  sm:rounded-2xl
                  sm:shadow-2xl
                "
              >
                {/* ===============================================
                    HEADER
                =============================================== */}

                <header
                  className="
                    relative
                    z-20
                    shrink-0
                    border-b
                    border-gray-200
                    bg-white
                  "
                  style={{
                    paddingTop:
                      "env(safe-area-inset-top)",
                  }}
                >
                  <div className="flex min-h-[58px] items-center justify-between gap-3 px-3 sm:min-h-[62px] sm:px-4">
                    {/* DOCUMENTO */}

                    <div className="flex min-w-0 items-center gap-3">
                      <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#AF1B1B]/8 text-[#AF1B1B] md:flex">
                        {
                          selectedItem.icon
                        }
                      </div>

                      <div className="min-w-0">
                        <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#AF1B1B] sm:text-[9px]">
                          {
                            selectedItem.category
                          }
                        </p>

                        <h2
                          id="sipoc-document-title"
                          className="
                            max-w-[220px]
                            truncate
                            text-[11px]
                            font-bold
                            text-[#171717]

                            sm:max-w-[430px]
                            sm:text-[13px]

                            lg:max-w-[600px]
                          "
                        >
                          {
                            selectedItem.title
                          }
                        </h2>
                      </div>
                    </div>

                    {/* TOOLBAR DESKTOP */}

                    <div className="hidden items-center gap-2 md:flex">
                      <div className="flex items-center rounded-lg border border-gray-200 bg-[#F8F8F8] p-0.5">
                        <button
                          type="button"
                          onClick={() =>
                            setFitMode(
                              "page"
                            )
                          }
                          className={`
                            flex
                            h-8
                            items-center
                            gap-1.5
                            rounded-md
                            px-2.5
                            text-[9px]
                            font-semibold
                            transition

                            ${
                              fitMode ===
                              "page"
                                ? "bg-white text-[#AF1B1B] shadow-sm"
                                : "text-gray-500 hover:bg-white"
                            }
                          `}
                        >
                          <FiMaximize />

                          Página
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setFitMode(
                              "width"
                            )
                          }
                          className={`
                            flex
                            h-8
                            items-center
                            gap-1.5
                            rounded-md
                            px-2.5
                            text-[9px]
                            font-semibold
                            transition

                            ${
                              fitMode ===
                              "width"
                                ? "bg-white text-[#AF1B1B] shadow-sm"
                                : "text-gray-500 hover:bg-white"
                            }
                          `}
                        >
                          <FiZoomIn />

                          Largura
                        </button>
                      </div>

                      <div className="flex items-center rounded-lg border border-gray-200 bg-[#F8F8F8] p-0.5">
                        <button
                          type="button"
                          onClick={
                            decreaseZoom
                          }
                          aria-label="Diminuir zoom"
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition hover:bg-white hover:text-[#AF1B1B]"
                        >
                          <FiMinus />
                        </button>

                        <button
                          type="button"
                          onClick={
                            resetZoom
                          }
                          title="Restaurar ajuste"
                          className="min-w-[52px] text-center text-[9px] font-semibold text-gray-500 transition hover:text-[#AF1B1B]"
                        >
                          {
                            zoomPercentage
                          }
                          %
                        </button>

                        <button
                          type="button"
                          onClick={
                            increaseZoom
                          }
                          aria-label="Aumentar zoom"
                          className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition hover:bg-white hover:text-[#AF1B1B]"
                        >
                          <FiPlus />
                        </button>
                      </div>

                      <a
                        href={
                          selectedPdfUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir PDF original"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-[#AF1B1B]"
                      >
                        <FiExternalLink />
                      </a>
                    </div>

                    {/* FECHAR */}

                    <button
                      type="button"
                      onClick={
                        closeDocument
                      }
                      aria-label="Fechar documento"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:border-[#AF1B1B] hover:bg-[#AF1B1B] hover:text-white"
                    >
                      <FiX />
                    </button>
                  </div>

                  {/* ===========================================
                      TOOLBAR MOBILE
                  =========================================== */}

                  <div className="flex items-center justify-between gap-2 overflow-x-auto border-t border-gray-100 px-2 py-2 md:hidden">
                    {/* FIT */}

                    <div className="flex shrink-0 items-center rounded-lg bg-gray-100 p-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setFitMode(
                            "page"
                          );
                        }}
                        className={`
                          h-8
                          rounded-md
                          px-3
                          text-[9px]
                          font-semibold
                          transition

                          ${
                            fitMode ===
                            "page"
                              ? "bg-white text-[#AF1B1B] shadow-sm"
                              : "text-gray-500"
                          }
                        `}
                      >
                        Tela
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setFitMode(
                            "width"
                          );
                        }}
                        className={`
                          h-8
                          rounded-md
                          px-3
                          text-[9px]
                          font-semibold
                          transition

                          ${
                            fitMode ===
                            "width"
                              ? "bg-white text-[#AF1B1B] shadow-sm"
                              : "text-gray-500"
                          }
                        `}
                      >
                        Largura
                      </button>
                    </div>

                    {/* ZOOM */}

                    <div className="flex shrink-0 items-center rounded-lg bg-gray-100 p-0.5">
                      <button
                        type="button"
                        onClick={
                          decreaseZoom
                        }
                        className="flex h-8 w-8 items-center justify-center text-gray-500 active:text-[#AF1B1B]"
                      >
                        <FiMinus />
                      </button>

                      <button
                        type="button"
                        onClick={
                          resetZoom
                        }
                        className="min-w-[46px] text-center text-[9px] font-semibold text-gray-500"
                      >
                        {
                          zoomPercentage
                        }
                        %
                      </button>

                      <button
                        type="button"
                        onClick={
                          increaseZoom
                        }
                        className="flex h-8 w-8 items-center justify-center text-gray-500 active:text-[#AF1B1B]"
                      >
                        <FiPlus />
                      </button>
                    </div>

                    <a
                      href={
                        selectedPdfUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 active:bg-gray-100 active:text-[#AF1B1B]"
                      aria-label="Abrir PDF original"
                    >
                      <FiExternalLink />
                    </a>
                  </div>
                </header>

                {/* ===============================================
                    VIEWER
                =============================================== */}

                <div
                  ref={viewerRef}
                  onTouchStart={
                    handleTouchStart
                  }
                  onTouchEnd={
                    handleTouchEnd
                  }
                  className="
                    relative
                    min-h-0
                    flex-1
                    overflow-auto
                    overscroll-contain
                    bg-[#DCDDDF]
                  "
                  style={{
                    WebkitOverflowScrolling:
                      "touch",
                  }}
                >
                  {/* =============================================
                      INDICAÇÃO SWIPE MOBILE
                  ============================================= */}

                  {isMobile &&
                    numPages > 1 &&
                    fitMode !==
                      "custom" && (
                      <div className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-[8px] font-medium text-white/90 backdrop-blur">
                        Deslize para trocar de página
                      </div>
                    )}

                  <div
                    className="
                      flex
                      min-h-full
                      min-w-full
                      items-center
                      justify-center
                      p-2

                      sm:p-6
                    "
                  >
                    <Document
                      file={
                        selectedPdfUrl
                      }
                      onLoadSuccess={({
                        numPages,
                      }) => {
                        setNumPages(
                          numPages
                        );

                        setCurrentPage(
                          1
                        );
                      }}
                      loading={
                        <div className="flex min-h-[300px] min-w-[260px] items-center justify-center">
                          <div className="text-center">
                            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-[3px] border-gray-300 border-t-[#AF1B1B]" />

                            <p className="mt-3 text-[11px] font-medium text-gray-500">
                              Preparando documento...
                            </p>
                          </div>
                        </div>
                      }
                      error={
                        <div className="mx-3 rounded-xl bg-white p-7 text-center shadow-sm">
                          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-[#AF1B1B]">
                            <FiX />
                          </div>

                          <h3 className="mt-3 text-sm font-bold text-gray-900">
                            Documento indisponível
                          </h3>

                          <p className="mt-1 text-xs text-gray-500">
                            Não foi possível carregar este PDF.
                          </p>
                        </div>
                      }
                    >
                      <div className="relative">
                        <Page
                          key={`${selectedItem.slug}-${currentPage}`}
                          pageNumber={
                            currentPage
                          }
                          scale={
                            finalScale
                          }
                          renderTextLayer={
                            false
                          }
                          renderAnnotationLayer={
                            false
                          }
                          onLoadSuccess={
                            handlePageLoad
                          }
                          onRenderSuccess={() =>
                            setIsPdfLoading(
                              false
                            )
                          }
                          loading={
                            <div className="flex h-[350px] w-[260px] items-center justify-center bg-white shadow-lg sm:h-[500px] sm:w-[400px]">
                              <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-200 border-t-[#AF1B1B]" />
                            </div>
                          }
                          className="
                            overflow-hidden
                            bg-white
                            shadow-[0_10px_40px_rgba(0,0,0,0.22)]
                          "
                        />

                        {/* LOADING SOBRE A PÁGINA */}

                        <AnimatePresence>
                          {isPdfLoading && (
                            <motion.div
                              initial={{
                                opacity:
                                  0,
                              }}
                              animate={{
                                opacity:
                                  1,
                              }}
                              exit={{
                                opacity:
                                  0,
                              }}
                              className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]"
                            >
                              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#AF1B1B]" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </Document>
                  </div>
                </div>

                {/* ===============================================
                    RODAPÉ / PAGINAÇÃO
                =============================================== */}

                <footer
                  className="
                    relative
                    z-20
                    shrink-0
                    border-t
                    border-gray-200
                    bg-white
                    px-3
                    py-2.5

                    sm:px-4
                  "
                  style={{
                    paddingBottom:
                      "max(10px, env(safe-area-inset-bottom))",
                  }}
                >
                  <div className="flex items-center justify-between gap-2">
                    {/* INFO DESKTOP */}

                    <div className="hidden min-w-0 flex-1 sm:block">
                      <p className="truncate text-[9px] text-gray-400">
                        {
                          selectedItem.title
                        }
                      </p>
                    </div>

                    {/* PAGINAÇÃO */}

                    <div className="mx-auto flex items-center gap-2">
                      <button
                        type="button"
                        onClick={
                          previousPage
                        }
                        disabled={
                          currentPage <=
                          1
                        }
                        className="
                          flex
                          h-9
                          items-center
                          gap-1
                          rounded-lg
                          border
                          border-gray-200
                          px-2.5
                          text-[9px]
                          font-semibold
                          text-gray-500
                          transition

                          hover:border-[#AF1B1B]/30
                          hover:text-[#AF1B1B]

                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        "
                      >
                        <FiChevronLeft />

                        <span className="hidden sm:inline">
                          Anterior
                        </span>
                      </button>

                      <div className="flex h-9 min-w-[82px] items-center justify-center rounded-lg bg-gray-100 px-3">
                        <span className="text-[10px] font-bold text-[#171717]">
                          {
                            currentPage
                          }
                        </span>

                        <span className="mx-1 text-[9px] text-gray-400">
                          /
                        </span>

                        <span className="text-[10px] text-gray-500">
                          {
                            numPages ||
                            "..."
                          }
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={
                          nextPage
                        }
                        disabled={
                          numPages ===
                            0 ||
                          currentPage >=
                            numPages
                        }
                        className="
                          flex
                          h-9
                          items-center
                          gap-1
                          rounded-lg
                          border
                          border-gray-200
                          px-2.5
                          text-[9px]
                          font-semibold
                          text-gray-500
                          transition

                          hover:border-[#AF1B1B]/30
                          hover:text-[#AF1B1B]

                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        "
                      >
                        <span className="hidden sm:inline">
                          Próxima
                        </span>

                        <FiChevronRight />
                      </button>
                    </div>

                    {/* ATALHOS DESKTOP */}

                    <div className="hidden flex-1 justify-end lg:flex">
                      <p className="text-[8px] text-gray-300">
                        ← → páginas • + − zoom • Esc fechar
                      </p>
                    </div>
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