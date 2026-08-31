"use client";

import {
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  FiArrowRight,
  FiBookOpen,
  FiChevronLeft,
  FiChevronRight,
  FiExternalLink,
  FiFileText,
  FiMaximize,
  FiMinus,
  FiPlus,
  FiShield,
  FiTruck,
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

type VehicleDocumentType =
  | "Termo"
  | "Manual";

type VehicleDocument = {
  title: string;
  description: string;
  slug: string;
  type: VehicleDocumentType;
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
   DOCUMENTOS
============================================================ */

const termoVeiculosData: VehicleDocument[] = [
  {
    title:
      "Termo de Responsabilidade",
    description:
      "Documento de compromisso e responsabilidade do colaborador durante a utilização dos veículos da empresa.",
    slug:
      "termo_de_responsabilidade",
    type: "Termo",
    icon: <FiFileText size={22} />,
  },
  {
    title:
      "Guia de Uso e Cuidados com os Veículos",
    description:
      "Boas práticas para condução, abastecimento, conservação e utilização segura dos veículos corporativos.",
    slug: "MANUAL_DE_USO",
    type: "Manual",
    icon: <FiTruck size={22} />,
  },
];

/* ============================================================
   COMPONENTE
============================================================ */

export default function TermoVeiculosPage() {
  const [
    selectedDocument,
    setSelectedDocument,
  ] =
    useState<VehicleDocument | null>(
      null
    );

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
    width: 595,
    height: 842,
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
     PDF URL
  ============================================================ */

  const selectedPdfUrl =
    selectedDocument
      ? encodeURI(
          `/pdfs/veiculo/${selectedDocument.slug}.pdf`
        )
      : "";

  /* ============================================================
     ABRIR DOCUMENTO
  ============================================================ */

  function openDocument(
    document: VehicleDocument
  ) {
    const mobile =
      window.innerWidth < 768;

    setSelectedDocument(
      document
    );

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
    setSelectedDocument(null);

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
    if (!selectedDocument) {
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
  }, [selectedDocument]);

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
     CARREGAMENTO DA PÁGINA
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
          numPages === 0 ||
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
    setFitMode("custom");

    setZoom(
      Math.min(
        finalScale + 0.1,
        2.5
      )
    );
  }

  function decreaseZoom() {
    setFitMode("custom");

    setZoom(
      Math.max(
        finalScale - 0.1,
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
    event: TouchEvent<HTMLDivElement>
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
    event: TouchEvent<HTMLDivElement>
  ) {
    /*
     * Com zoom manual, o usuário deve
     * poder arrastar o documento.
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

    const differenceX =
      endX -
      touchStartX.current;

    const differenceY =
      endY -
      touchStartY.current;

    touchStartX.current = null;
    touchStartY.current = null;

    /*
     * Evita trocar de página durante
     * um scroll vertical.
     */
    if (
      Math.abs(differenceX) <
        70 ||
      Math.abs(differenceX) <=
        Math.abs(differenceY)
    ) {
      return;
    }

    if (differenceX < 0) {
      nextPage();
    } else {
      previousPage();
    }
  }

  /* ============================================================
     MODAL / TECLADO
  ============================================================ */

  useEffect(() => {
    if (!selectedDocument) {
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
              current >=
              numPages
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
    selectedDocument,
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
            {/* DESTAQUE LATERAL */}

            <div className="absolute bottom-0 left-0 top-0 w-[4px] bg-[#AF1B1B]" />

            {/* EFEITO DE FUNDO */}

            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#AF1B1B]/[0.04] blur-3xl" />

            <div className="relative px-5 py-5 sm:px-7 sm:py-6 lg:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                {/* TEXTO */}

                <div className="max-w-3xl">
                  <div className="mb-2 flex items-center gap-2">
                    <FiTruck className="text-[#AF1B1B]" />

                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#AF1B1B] sm:text-[11px]">
                      Frota Corporativa
                    </p>
                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-[#171717] sm:text-3xl">
                    Veículos
                  </h1>

                  <p className="mt-2 max-w-3xl text-[13px] leading-5 text-gray-500 sm:text-sm sm:leading-6">
                    Consulte os termos, orientações e boas práticas para uso
                    seguro e responsável dos veículos corporativos da Projeta.
                  </p>
                </div>

                {/* CONTADOR */}

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#AF1B1B]/8 text-[#AF1B1B]">
                    <FiBookOpen size={18} />
                  </div>

                  <div>
                    <p className="text-xl font-black leading-none text-[#171717]">
                      {
                        termoVeiculosData.length
                      }
                    </p>

                    <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                      Documentos
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.header>

          {/* =====================================================
              DOCUMENTOS
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
                Documentação
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#171717] sm:text-xl">
                Uso dos veículos
              </h2>

              <p className="mt-1 max-w-2xl text-xs leading-5 text-gray-500">
                Selecione um documento para consultar as responsabilidades e
                orientações relacionadas à frota corporativa.
              </p>
            </div>

            {/* =================================================
                GRID
            ================================================= */}

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:max-w-[950px]">
              {termoVeiculosData.map(
                (
                  item,
                  index
                ) => (
                  <motion.button
                    key={
                      item.slug
                    }
                    type="button"
                    onClick={() =>
                      openDocument(
                        item
                      )
                    }
                    initial={{
                      opacity: 0,
                      y: 12,
                      scale: 0.98,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    transition={{
                      delay:
                        0.12 +
                        index *
                          0.06,
                      duration: 0.3,
                    }}
                    className="
                      group
                      relative
                      flex
                      min-h-[175px]
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
                    {/* LINHA SUPERIOR */}

                    <span className="absolute left-0 top-0 h-[3px] w-0 bg-[#AF1B1B] transition-all duration-300 group-hover:w-full" />

                    {/* CONTEÚDO */}

                    <div className="flex items-start gap-3">
                      {/* ÍCONE */}

                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          bg-[#AF1B1B]/8
                          text-[#AF1B1B]
                          transition-all

                          group-hover:scale-105
                          group-hover:bg-[#AF1B1B]/12
                        "
                      >
                        {
                          item.icon
                        }
                      </div>

                      {/* TEXTO */}

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

                      {/* SETA */}

                      <FiArrowRight
                        size={16}
                        className="
                          mt-1
                          shrink-0
                          text-gray-300
                          transition-all

                          group-hover:translate-x-1
                          group-hover:text-[#AF1B1B]
                        "
                      />
                    </div>

                    {/* RODAPÉ DO CARD */}

                    <div className="mt-auto flex items-end justify-between gap-3 pt-5">
                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-md
                          bg-gray-100
                          px-2
                          py-1
                          text-[9px]
                          font-bold
                          uppercase
                          tracking-[0.08em]
                          text-gray-500
                          transition

                          group-hover:bg-[#AF1B1B]/8
                          group-hover:text-[#AF1B1B]
                        "
                      >
                        {item.type ===
                        "Termo" ? (
                          <FiShield size={11} />
                        ) : (
                          <FiBookOpen size={11} />
                        )}

                        {
                          item.type
                        }
                      </span>

                      <span className="text-[9px] font-semibold text-gray-300 transition group-hover:text-[#AF1B1B]">
                        Visualizar documento
                      </span>
                    </div>
                  </motion.button>
                )
              )}
            </div>
          </motion.section>

          {/* =====================================================
              INFORMAÇÃO
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
              mt-5
              max-w-[950px]
              rounded-2xl
              border
              border-gray-200
              bg-white
              p-4
              shadow-sm

              sm:p-5
            "
          >
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                <FiTruck size={17} />
              </div>

              <div>
                <p className="text-[12px] font-bold text-[#171717]">
                  Uso responsável da frota
                </p>

                <p className="mt-1 max-w-3xl text-[11px] leading-5 text-gray-500 sm:text-[12px]">
                  Os veículos corporativos devem ser utilizados de acordo com
                  as orientações internas, priorizando segurança, conservação
                  do patrimônio e cumprimento das regras estabelecidas pela
                  empresa.
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
            VISUALIZADOR PDF
        ===================================================== */}

        <AnimatePresence>
          {selectedDocument && (
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
              aria-labelledby="vehicle-document-title"
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
                  sm:max-w-[1500px]
                  sm:rounded-2xl
                  sm:shadow-2xl
                "
              >
                {/* ===============================================
                    CABEÇALHO
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
                  {/* LINHA PRINCIPAL */}

                  <div className="flex min-h-[58px] items-center justify-between gap-3 px-3 sm:min-h-[62px] sm:px-4">
                    {/* DOCUMENTO */}

                    <div className="flex min-w-0 items-center gap-3">
                      <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#AF1B1B]/8 text-[#AF1B1B] md:flex">
                        {
                          selectedDocument.icon
                        }
                      </div>

                      <div className="min-w-0">
                        <p className="text-[8px] font-bold uppercase tracking-[0.13em] text-[#AF1B1B] sm:text-[9px]">
                          {
                            selectedDocument.type
                          }{" "}
                          • Veículos
                        </p>

                        <h2
                          id="vehicle-document-title"
                          className="
                            max-w-[215px]
                            truncate
                            text-[11px]
                            font-bold
                            text-[#171717]

                            sm:max-w-[430px]
                            sm:text-[13px]

                            lg:max-w-[620px]
                          "
                        >
                          {
                            selectedDocument.title
                          }
                        </h2>
                      </div>
                    </div>

                    {/* ===========================================
                        CONTROLES DESKTOP
                    =========================================== */}

                    <div className="hidden items-center gap-2 md:flex">
                      {/* AJUSTE */}

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

                      {/* ZOOM */}

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
                          title="Restaurar visualização"
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

                      {/* NOVA ABA */}

                      <a
                        href={
                          selectedPdfUrl
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Abrir PDF original"
                        aria-label="Abrir PDF original"
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
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-gray-200
                        text-gray-400
                        transition

                        hover:border-[#AF1B1B]
                        hover:bg-[#AF1B1B]
                        hover:text-white
                      "
                    >
                      <FiX />
                    </button>
                  </div>

                  {/* ===========================================
                      CONTROLES MOBILE
                  =========================================== */}

                  <div className="flex items-center justify-between gap-2 overflow-x-auto border-t border-gray-100 px-2 py-2 md:hidden">
                    {/* FIT */}

                    <div className="flex shrink-0 items-center rounded-lg bg-gray-100 p-0.5">
                      <button
                        type="button"
                        onClick={() =>
                          setFitMode(
                            "page"
                          )
                        }
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
                        onClick={() =>
                          setFitMode(
                            "width"
                          )
                        }
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
                        aria-label="Diminuir zoom"
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
                        aria-label="Aumentar zoom"
                      >
                        <FiPlus />
                      </button>
                    </div>

                    {/* NOVA ABA */}

                    <a
                      href={
                        selectedPdfUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Abrir PDF original"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-400 active:bg-gray-100 active:text-[#AF1B1B]"
                    >
                      <FiExternalLink />
                    </a>
                  </div>
                </header>

                {/* ===============================================
                    VIEWER
                =============================================== */}

                <div
                  ref={
                    viewerRef
                  }
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
                  {/* SWIPE MOBILE */}

                  {isMobile &&
                    numPages > 1 &&
                    fitMode !==
                      "custom" && (
                      <div className="pointer-events-none absolute left-1/2 top-2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-black/55 px-3 py-1 text-[8px] font-medium text-white/90 backdrop-blur">
                        Deslize para trocar de página
                      </div>
                    )}

                  {/* PDF */}

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
                        <div className="mx-3 rounded-2xl bg-white p-7 text-center shadow-sm">
                          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-[#AF1B1B]">
                            <FiX />
                          </div>

                          <h3 className="mt-3 text-sm font-bold text-gray-900">
                            Documento indisponível
                          </h3>

                          <p className="mt-1 text-xs text-gray-500">
                            Não foi possível carregar este PDF.
                          </p>

                          <a
                            href={
                              selectedPdfUrl
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#AF1B1B] hover:underline"
                          >
                            Tentar abrir PDF original

                            <FiExternalLink />
                          </a>
                        </div>
                      }
                    >
                      <div className="relative">
                        <Page
                          key={`${selectedDocument.slug}-${currentPage}`}
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

                        {/* OVERLAY DE CARREGAMENTO */}

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
                    PAGINAÇÃO
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
                    {/* TÍTULO DESKTOP */}

                    <div className="hidden min-w-0 flex-1 sm:block">
                      <p className="truncate text-[9px] text-gray-400">
                        {
                          selectedDocument.title
                        }
                      </p>
                    </div>

                    {/* PÁGINAS */}

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

                    {/* ATALHOS */}

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