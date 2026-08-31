"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type RefObject,
} from "react";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Eraser,
  FileDown,
  FileWarning,
  MapPin,
  RotateCcw,
  ShieldCheck,
  Signature,
  UserRound,
  X,
} from "lucide-react";

import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";

import SignatureCanvas from "react-signature-canvas";

import { ProtectedRoute } from "@/components/ProtectedRoute";

import { Button } from "@/components/ui/button";

/* ============================================================
   TIPOS
============================================================ */

type DireitoRecusaFormData = {
  gerenciaArea: string;
  supervisorChefiaImediata: string;
  nomeEmpregado: string;
  matricula: string;
  empresa: string;
  localOuEquipamento: string;
  descricaoCondicaoObservada: string;
  nomeSupervisorChefia: string;
  assinaturaEmpregado: string;
  dataEmpregado: string;
};

type SignatureFieldProps = {
  label: string;
  canvasRef: RefObject<SignatureCanvas | null>;
  onClear: () => void;
};

/* ============================================================
   FORMULÁRIO INICIAL
============================================================ */

const initialForm: DireitoRecusaFormData = {
  gerenciaArea: "",
  supervisorChefiaImediata: "",
  nomeEmpregado: "",
  matricula: "",
  empresa: "",
  localOuEquipamento: "",
  descricaoCondicaoObservada: "",
  nomeSupervisorChefia: "",
  assinaturaEmpregado: "",
  dataEmpregado: "",
};

/* ============================================================
   CLASSES
============================================================ */

const inputClass = `
  h-11
  w-full
  rounded-xl
  border
  border-gray-200
  bg-[#FAFAFA]
  px-3.5
  text-[13px]
  text-gray-900
  outline-none
  transition-all
  duration-200

  placeholder:text-gray-400

  hover:border-gray-300

  focus:border-[#AF1B1B]/50
  focus:bg-white
  focus:ring-4
  focus:ring-[#AF1B1B]/5
`;

const labelClass =
  "mb-1.5 block text-[12px] font-semibold text-gray-700";

const requiredMark = (
  <span className="ml-0.5 text-[#AF1B1B]">
    *
  </span>
);

/* ============================================================
   ASSINATURA
============================================================ */

function SignatureField({
  label,
  canvasRef,
  onClear,
}: SignatureFieldProps) {
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="text-[12px] font-semibold text-gray-700">
          {label}
          {requiredMark}
        </label>

        <button
          type="button"
          onClick={onClear}
          className="
            inline-flex
            items-center
            gap-1.5
            rounded-lg
            px-2
            py-1
            text-[10px]
            font-semibold
            text-gray-500
            transition

            hover:bg-[#AF1B1B]/5
            hover:text-[#AF1B1B]
          "
        >
          <Eraser className="h-3.5 w-3.5" />
          Limpar
        </button>
      </div>

      <div
        className="
          overflow-hidden
          rounded-xl
          border
          border-gray-200
          bg-white
          p-2
          transition-all

          focus-within:border-[#AF1B1B]/40
          focus-within:ring-4
          focus-within:ring-[#AF1B1B]/5
        "
      >
        <SignatureCanvas
          ref={canvasRef}
          penColor="black"
          canvasProps={{
            className:
              "h-36 w-full touch-none rounded-lg bg-white",
          }}
        />
      </div>

      <p className="mt-1.5 text-[10px] leading-4 text-gray-400">
        Assine utilizando o mouse ou o toque na tela.
      </p>
    </div>
  );
}

/* ============================================================
   COMPONENTE
============================================================ */

export default function SegurancaTrabalhoPage() {
  const [form, setForm] =
    useState<DireitoRecusaFormData>(
      initialForm
    );

  const [
    isGenerating,
    setIsGenerating,
  ] = useState(false);

  const [openForm, setOpenForm] =
    useState(false);

  const assinaturaEmpregadoRef =
    useRef<SignatureCanvas | null>(
      null
    );

  /* ============================================================
     MODAL / SCROLL / ESC
  ============================================================ */

  useEffect(() => {
    if (!openForm) {
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
        event.key === "Escape" &&
        !isGenerating
      ) {
        setOpenForm(false);
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
  }, [openForm, isGenerating]);

  /* ============================================================
     ALTERAÇÃO DOS CAMPOS
  ============================================================ */

  const handleChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } =
      event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ============================================================
     ASSINATURA
  ============================================================ */

  const clearSignature = (
    ref: RefObject<SignatureCanvas | null>
  ) => {
    ref.current?.clear();
  };

  const getSignatureData = (
    ref: RefObject<SignatureCanvas | null>
  ) => {
    if (
      !ref.current ||
      ref.current.isEmpty()
    ) {
      return "";
    }

    return ref.current
      .getTrimmedCanvas()
      .toDataURL("image/png");
  };

  /* ============================================================
     RESET
  ============================================================ */

  const handleReset = () => {
    setForm(initialForm);

    assinaturaEmpregadoRef.current?.clear();
  };

  /* ============================================================
     FECHAR
  ============================================================ */

  const handleCloseModal = () => {
    if (isGenerating) {
      return;
    }

    setOpenForm(false);
  };

  /* ============================================================
     QUEBRA DE TEXTO
  ============================================================ */

  const splitTextByLength = (
    text: string,
    maxChars: number
  ) => {
    if (!text) {
      return [];
    }

    const words = text.split(" ");

    const lines: string[] = [];

    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine
        ? `${currentLine} ${word}`
        : word;

      if (
        testLine.length <= maxChars
      ) {
        currentLine = testLine;
      } else {
        if (currentLine) {
          lines.push(currentLine);
        }

        currentLine = word;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  /* ============================================================
     GERAÇÃO PDF
  ============================================================ */

  const handleExportPdf =
    async () => {
      try {
        setIsGenerating(true);

        const assinatura =
          getSignatureData(
            assinaturaEmpregadoRef
          );

        if (
          !form.nomeEmpregado.trim() ||
          !form.matricula.trim() ||
          !form.localOuEquipamento.trim() ||
          !form.descricaoCondicaoObservada.trim() ||
          !form.dataEmpregado.trim()
        ) {
          alert(
            "Preencha os campos obrigatórios: Nome do Empregado, Matrícula, Local ou equipamento, Descrição da condição observada e Data."
          );

          return;
        }

        if (!assinatura) {
          alert(
            "A assinatura do empregado é obrigatória para extrair o PDF."
          );

          return;
        }

        /* ======================================================
           TEMPLATE
        ====================================================== */

        const response = await fetch(
          "/pdfs/seguranca-trabalho/direito_de_recusa.pdf"
        );

        if (!response.ok) {
          throw new Error(
            `Não foi possível carregar o modelo do PDF. Status ${response.status}.`
          );
        }

        const existingPdfBytes =
          await response.arrayBuffer();

        const pdfDoc =
          await PDFDocument.load(
            existingPdfBytes
          );

        const page =
          pdfDoc.getPage(0);

        const { height } =
          page.getSize();

        const font =
          await pdfDoc.embedFont(
            StandardFonts.Helvetica
          );

        const fontBold =
          await pdfDoc.embedFont(
            StandardFonts.HelveticaBold
          );

        /* ======================================================
           TEXTO
        ====================================================== */

        const drawText = (
          text: string,
          x: number,
          y: number,
          size = 9,
          bold = false
        ) => {
          page.drawText(
            text || "",
            {
              x,
              y,
              size,
              font: bold
                ? fontBold
                : font,
              color: rgb(
                0,
                0,
                0
              ),
            }
          );
        };

        /* ======================================================
           ASSINATURA
        ====================================================== */

        const assinaturaBase64 =
          assinatura.split(",")[1];

        const assinaturaBytes =
          Uint8Array.from(
            atob(
              assinaturaBase64
            ),
            (character) =>
              character.charCodeAt(
                0
              )
          );

        const assinaturaImage =
          await pdfDoc.embedPng(
            assinaturaBytes
          );

        /* ======================================================
           BLOCO 1
        ====================================================== */

        drawText(
          form.gerenciaArea,
          40,
          height - 107,
          9
        );

        drawText(
          form.supervisorChefiaImediata,
          340,
          height - 107,
          9
        );

        /* ======================================================
           BLOCO 2
        ====================================================== */

        drawText(
          form.nomeEmpregado,
          40,
          height - 149,
          9
        );

        drawText(
          form.matricula,
          340,
          height - 149,
          9
        );

        /* ======================================================
           BLOCO 3
        ====================================================== */

        drawText(
          form.empresa,
          40,
          height - 183,
          9
        );

        /* ======================================================
           BLOCO 4
        ====================================================== */

        drawText(
          form.localOuEquipamento,
          40,
          height - 255,
          9
        );

        /* ======================================================
           BLOCO 5
        ====================================================== */

        const descricaoLines =
          splitTextByLength(
            form.descricaoCondicaoObservada,
            88
          );

        let yDescricao =
          height - 310;

        descricaoLines
          .slice(0, 8)
          .forEach((line) => {
            drawText(
              line,
              40,
              yDescricao,
              9
            );

            yDescricao -= 12;
          });

        /* ======================================================
           BLOCO 6
        ====================================================== */

        drawText(
          form.nomeSupervisorChefia,
          42,
          height - 405,
          9
        );

        /* ======================================================
           BLOCO 7
        ====================================================== */

        page.drawImage(
          assinaturaImage,
          {
            x: 160,
            y: height - 450,
            width: 75,
            height: 20,
          }
        );

        /* ======================================================
           BLOCO 8
        ====================================================== */

        drawText(
          form.dataEmpregado,
          450,
          height - 440,
          9
        );

        /* ======================================================
           EXPORTAÇÃO
        ====================================================== */

        const pdfBytes =
          await pdfDoc.save();

        const pdfBuffer =
          new ArrayBuffer(
            pdfBytes.length
          );

        new Uint8Array(
          pdfBuffer
        ).set(pdfBytes);

        const blob = new Blob(
          [pdfBuffer],
          {
            type: "application/pdf",
          }
        );

        const url =
          URL.createObjectURL(
            blob
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;

        link.download =
          `direito-de-recusa-${form.nomeEmpregado
            .trim()
            .replace(/\s+/g, "-")
            .toLowerCase()}.pdf`;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        setTimeout(() => {
          URL.revokeObjectURL(
            url
          );
        }, 1000);
      } catch (error) {
        console.error(
          "Erro ao gerar PDF:",
          error
        );

        alert(
          "Não foi possível gerar o PDF."
        );
      } finally {
        setIsGenerating(false);
      }
    };

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
            <div className="absolute left-0 top-0 h-full w-[4px] bg-[#AF1B1B]" />

            <div className="px-5 py-5 sm:px-7 sm:py-6 lg:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-3xl">
                  <div className="mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-[#AF1B1B]" />

                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#AF1B1B] sm:text-[11px]">
                      Biblioteca Corporativa
                    </p>
                  </div>

                  <h1 className="text-2xl font-black tracking-tight text-[#171717] sm:text-3xl">
                    Segurança do Trabalho
                  </h1>

                  <p className="mt-2 max-w-3xl text-[13px] leading-5 text-gray-500 sm:text-sm sm:leading-6">
                    Consulte documentos e formulários relacionados à
                    prevenção de riscos, registros internos e segurança dos
                    colaboradores.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-gray-400">
                  <span className="h-2 w-2 rounded-full bg-[#AF1B1B]" />

                  1 formulário disponível
                </div>
              </div>
            </div>
          </motion.header>

          {/* =====================================================
              CONTEÚDO
          ===================================================== */}

          <section className="mt-5 sm:mt-6">
            <motion.div
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
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#AF1B1B]">
                Formulários
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#171717] sm:text-xl">
                Recursos disponíveis
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Acesse o formulário necessário para registrar uma ocorrência
                relacionada à segurança.
              </p>

              {/* =================================================
                  CARD MODERNO
              ================================================= */}

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                <motion.button
                  type="button"
                  onClick={() =>
                    setOpenForm(true)
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
                    delay: 0.14,
                    duration: 0.3,
                  }}
                  className="
                    group
                    relative
                    flex
                    min-h-[155px]
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
                    hover:shadow-[0_10px_30px_rgba(0,0,0,0.07)]

                    active:scale-[0.99]

                    sm:p-5
                  "
                >
                  <div className="flex items-start gap-3">
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
                      <FileWarning className="h-5 w-5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-[15px] font-bold text-[#171717]">
                        Direito de Recusa
                      </h3>

                      <p className="mt-1.5 text-[12px] leading-5 text-gray-500">
                        Registre uma condição de risco grave e iminente e gere
                        o documento oficial para continuidade do fluxo.
                      </p>
                    </div>

                    <ArrowRight
                      className="
                        mt-1
                        h-4
                        w-4
                        shrink-0
                        text-gray-300
                        transition-all

                        group-hover:translate-x-1
                        group-hover:text-[#AF1B1B]
                      "
                    />
                  </div>

                  <div className="mt-auto pt-4">
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
                        transition-colors

                        group-hover:bg-[#AF1B1B]/8
                        group-hover:text-[#AF1B1B]
                      "
                    >
                      <BadgeCheck className="h-3 w-3" />
                      Formulário interno
                    </span>
                  </div>
                </motion.button>
              </div>
            </motion.div>
          </section>

          {/* =====================================================
              FOOTER
          ===================================================== */}

          <footer
            className="py-6 text-center text-[10px] text-gray-400 sm:text-[11px]"
            suppressHydrationWarning
          >
            © {new Date().getFullYear()} Projeta • Sistema Interno
            Corporativo
          </footer>
        </div>

        {/* =====================================================
            MODAL
        ===================================================== */}

        <AnimatePresence>
          {openForm && (
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
                bg-black/70
                backdrop-blur-[2px]

                sm:p-3
              "
              role="dialog"
              aria-modal="true"
              aria-labelledby="direito-recusa-title"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 12,
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="
                  relative
                  flex
                  h-[100dvh]
                  w-full
                  flex-col
                  overflow-hidden
                  bg-[#F5F5F5]

                  sm:h-[95vh]
                  sm:max-w-6xl
                  sm:rounded-2xl
                  sm:border
                  sm:border-white/20
                  sm:shadow-2xl
                "
              >
                {/* =================================================
                    HEADER MODAL
                ================================================= */}

                <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-3 sm:px-5 sm:py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#AF1B1B]/10 text-[#AF1B1B] sm:flex">
                        <FileWarning className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#AF1B1B]">
                          Segurança do Trabalho
                        </p>

                        <h2
                          id="direito-recusa-title"
                          className="mt-0.5 text-base font-bold text-[#171717] sm:text-lg"
                        >
                          Direito de Recusa
                        </h2>

                        <p className="mt-0.5 hidden text-[11px] text-gray-500 sm:block">
                          Preencha as etapas abaixo para gerar o documento
                          oficial.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={
                        handleCloseModal
                      }
                      disabled={
                        isGenerating
                      }
                      aria-label="Fechar formulário"
                      className="
                        flex
                        h-9
                        w-9
                        shrink-0
                        items-center
                        justify-center
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        text-gray-400
                        transition

                        hover:border-[#AF1B1B]/30
                        hover:bg-[#AF1B1B]
                        hover:text-white

                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* ===============================================
                      ETAPAS VISUAIS
                  =============================================== */}

                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1 sm:mt-4">
                    {[
                      {
                        number: "01",
                        label:
                          "Identificação",
                      },
                      {
                        number: "02",
                        label:
                          "Declaração",
                      },
                      {
                        number: "03",
                        label:
                          "Ocorrência",
                      },
                      {
                        number: "04",
                        label:
                          "Confirmação",
                      },
                    ].map(
                      (
                        step,
                        index
                      ) => (
                        <div
                          key={
                            step.number
                          }
                          className="
                            flex
                            shrink-0
                            items-center
                            gap-2
                            rounded-lg
                            bg-gray-50
                            px-2.5
                            py-1.5
                          "
                        >
                          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#AF1B1B]/10 text-[8px] font-bold text-[#AF1B1B]">
                            {
                              step.number
                            }
                          </span>

                          <span className="text-[10px] font-semibold text-gray-500">
                            {
                              step.label
                            }
                          </span>

                          {index <
                            3 && (
                            <ArrowRight className="hidden h-3 w-3 text-gray-300 sm:block" />
                          )}
                        </div>
                      )
                    )}
                  </div>
                </header>

                {/* =================================================
                    CONTEÚDO
                ================================================= */}

                <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
                  <form
                    onSubmit={(event) =>
                      event.preventDefault()
                    }
                    className="mx-auto w-full max-w-5xl space-y-4 px-3 py-4 sm:space-y-5 sm:px-5 sm:py-5"
                  >
                    {/* =============================================
                        ALERTA
                    ============================================= */}

                    <div
                      className="
                        flex
                        items-start
                        gap-3
                        rounded-xl
                        border
                        border-amber-200
                        bg-amber-50
                        p-3
                        text-[11px]
                        leading-5
                        text-amber-900

                        sm:p-4
                        sm:text-[12px]
                      "
                    >
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />

                      <p>
                        Após preencher as informações obrigatórias, utilize{" "}
                        <strong>
                          Extrair PDF
                        </strong>{" "}
                        para gerar o documento no modelo oficial.
                      </p>
                    </div>

                    {/* =============================================
                        ETAPA 1
                    ============================================= */}

                    <motion.section
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#AF1B1B]/8 text-[#AF1B1B]">
                          <UserRound className="h-[18px] w-[18px]" />
                        </div>

                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Etapa 01
                          </p>

                          <h3 className="text-[13px] font-bold text-[#171717] sm:text-sm">
                            Identificação
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 sm:p-5">
                        <div>
                          <label className={labelClass}>
                            Gerência de Área
                          </label>

                          <input
                            type="text"
                            name="gerenciaArea"
                            value={
                              form.gerenciaArea
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="Informe a gerência"
                            className={
                              inputClass
                            }
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            Supervisor/Chefia Imediata
                          </label>

                          <input
                            type="text"
                            name="supervisorChefiaImediata"
                            value={
                              form.supervisorChefiaImediata
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="Informe o responsável"
                            className={
                              inputClass
                            }
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            Nome do Empregado
                            {requiredMark}
                          </label>

                          <input
                            type="text"
                            name="nomeEmpregado"
                            value={
                              form.nomeEmpregado
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="Nome completo"
                            className={
                              inputClass
                            }
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            Matrícula
                            {requiredMark}
                          </label>

                          <input
                            type="text"
                            name="matricula"
                            value={
                              form.matricula
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="Informe a matrícula"
                            className={
                              inputClass
                            }
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className={labelClass}>
                            Empresa
                          </label>

                          <div className="relative">
                            <Building2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <input
                              type="text"
                              name="empresa"
                              value={
                                form.empresa
                              }
                              onChange={
                                handleChange
                              }
                              placeholder="Informe a empresa"
                              className={`${inputClass} pl-10`}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.section>

                    {/* =============================================
                        ETAPA 2
                    ============================================= */}

                    <motion.section
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: 0.04,
                      }}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#AF1B1B]/8 text-[#AF1B1B]">
                          <ShieldCheck className="h-[18px] w-[18px]" />
                        </div>

                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Etapa 02
                          </p>

                          <h3 className="text-[13px] font-bold text-[#171717] sm:text-sm">
                            Declaração
                          </h3>
                        </div>
                      </div>

                      <div className="p-4 sm:p-5">
                        <div
                          className="
                            relative
                            overflow-hidden
                            rounded-xl
                            border
                            border-gray-200
                            bg-[#FAFAFA]
                            p-4
                          "
                        >
                          <div className="absolute bottom-0 left-0 top-0 w-[3px] bg-[#AF1B1B]" />

                          <p className="pl-2 text-[12px] leading-6 text-gray-600 sm:text-[13px]">
                            “Conforme análise da condição de trabalho,
                            verifiquei uma condição de risco grave e iminente
                            para minha segurança e saúde e/ou de terceiros,
                            paralisando temporariamente as minhas atividades
                            até que as correções sejam implementadas”.
                          </p>
                        </div>
                      </div>
                    </motion.section>

                    {/* =============================================
                        ETAPA 3
                    ============================================= */}

                    <motion.section
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: 0.08,
                      }}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#AF1B1B]/8 text-[#AF1B1B]">
                          <MapPin className="h-[18px] w-[18px]" />
                        </div>

                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Etapa 03
                          </p>

                          <h3 className="text-[13px] font-bold text-[#171717] sm:text-sm">
                            Registro da Ocorrência
                          </h3>
                        </div>
                      </div>

                      <div className="space-y-4 p-4 sm:p-5">
                        <div>
                          <label className={labelClass}>
                            Local ou equipamento
                            {requiredMark}
                          </label>

                          <input
                            type="text"
                            name="localOuEquipamento"
                            value={
                              form.localOuEquipamento
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="Informe onde a condição foi identificada"
                            className={
                              inputClass
                            }
                          />
                        </div>

                        <div>
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <label className="text-[12px] font-semibold text-gray-700">
                              Descrição da condição observada
                              {requiredMark}
                            </label>

                            <span className="text-[9px] text-gray-400">
                              {
                                form
                                  .descricaoCondicaoObservada
                                  .length
                              }{" "}
                              caracteres
                            </span>
                          </div>

                          <textarea
                            name="descricaoCondicaoObservada"
                            value={
                              form.descricaoCondicaoObservada
                            }
                            onChange={
                              handleChange
                            }
                            rows={6}
                            placeholder="Descreva de forma objetiva a condição de risco identificada..."
                            className={`
                              w-full
                              resize-y
                              rounded-xl
                              border
                              border-gray-200
                              bg-[#FAFAFA]
                              px-3.5
                              py-3
                              text-[13px]
                              leading-5
                              text-gray-900
                              outline-none
                              transition-all

                              placeholder:text-gray-400

                              focus:border-[#AF1B1B]/50
                              focus:bg-white
                              focus:ring-4
                              focus:ring-[#AF1B1B]/5
                            `}
                          />
                        </div>

                        <div>
                          <label className={labelClass}>
                            Nome do supervisor/chefia imediata
                          </label>

                          <input
                            type="text"
                            name="nomeSupervisorChefia"
                            value={
                              form.nomeSupervisorChefia
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="Informe quem foi comunicado"
                            className={
                              inputClass
                            }
                          />
                        </div>
                      </div>
                    </motion.section>

                    {/* =============================================
                        ETAPA 4
                    ============================================= */}

                    <motion.section
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: 0.12,
                      }}
                      className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
                    >
                      <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 sm:px-5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#AF1B1B]/8 text-[#AF1B1B]">
                          <Signature className="h-[18px] w-[18px]" />
                        </div>

                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-gray-400">
                            Etapa 04
                          </p>

                          <h3 className="text-[13px] font-bold text-[#171717] sm:text-sm">
                            Confirmação do Empregado
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-5 p-4 sm:p-5 md:grid-cols-[1.5fr_1fr]">
                        <SignatureField
                          label="Assinatura do empregado"
                          canvasRef={
                            assinaturaEmpregadoRef
                          }
                          onClear={() =>
                            clearSignature(
                              assinaturaEmpregadoRef
                            )
                          }
                        />

                        <div>
                          <label className={labelClass}>
                            Data
                            {requiredMark}
                          </label>

                          <div className="relative">
                            <CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />

                            <input
                              type="date"
                              name="dataEmpregado"
                              value={
                                form.dataEmpregado
                              }
                              onChange={
                                handleChange
                              }
                              className={`${inputClass} pl-10`}
                            />
                          </div>

                          <div className="mt-4 rounded-xl bg-gray-50 p-3">
                            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                              Importante
                            </p>

                            <p className="mt-1 text-[11px] leading-5 text-gray-500">
                              A assinatura e a data serão inseridas diretamente
                              no documento oficial gerado.
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.section>

                    {/* =============================================
                        PRÓXIMO PASSO
                    ============================================= */}

                    <div className="rounded-xl border border-gray-200 bg-white p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                          <FileDown className="h-4 w-4" />
                        </div>

                        <div>
                          <p className="text-[12px] font-bold text-gray-800">
                            Próximo passo
                          </p>

                          <p className="mt-1 text-[11px] leading-5 text-gray-500">
                            Ao extrair o PDF, o sistema utilizará o modelo
                            oficial e manterá os demais campos e assinaturas em
                            branco para continuidade do preenchimento.
                          </p>
                        </div>
                      </div>
                    </div>
                  </form>
                </main>

                {/* =================================================
                    AÇÕES FIXAS
                ================================================= */}

                <footer
                  className="
                    shrink-0
                    border-t
                    border-gray-200
                    bg-white
                    px-3
                    py-3

                    sm:px-5
                  "
                  style={{
                    paddingBottom:
                      "max(12px, env(safe-area-inset-bottom))",
                  }}
                >
                  <div className="mx-auto flex w-full max-w-5xl flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <p className="hidden text-[10px] text-gray-400 sm:block">
                      Os campos marcados com{" "}
                      <span className="font-bold text-[#AF1B1B]">
                        *
                      </span>{" "}
                      são obrigatórios.
                    </p>

                    <div className="flex w-full gap-2 sm:w-auto">
                      <Button
                        type="button"
                        onClick={
                          handleReset
                        }
                        disabled={
                          isGenerating
                        }
                        variant="outline"
                        className="
                          h-10
                          flex-1
                          cursor-pointer
                          rounded-xl
                          border-gray-200
                          px-4
                          text-xs
                          text-gray-600

                          hover:bg-gray-50

                          sm:flex-none
                        "
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Limpar
                      </Button>

                      <Button
                        type="button"
                        onClick={
                          handleExportPdf
                        }
                        disabled={
                          isGenerating
                        }
                        className="
                          h-10
                          flex-[1.4]
                          cursor-pointer
                          rounded-xl
                          bg-[#AF1B1B]
                          px-5
                          text-xs
                          font-semibold
                          text-white
                          shadow-sm

                          hover:bg-[#8C1616]
                          hover:shadow-md

                          disabled:cursor-not-allowed
                          disabled:opacity-60

                          sm:flex-none
                        "
                      >
                        {isGenerating ? (
                          <>
                            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                            Gerando...
                          </>
                        ) : (
                          <>
                            <FileDown className="mr-2 h-4 w-4" />
                            Extrair PDF
                          </>
                        )}
                      </Button>
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