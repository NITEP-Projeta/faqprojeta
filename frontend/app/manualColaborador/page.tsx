"use client";

import {
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import Image from "next/image";

import {
  AnimatePresence,
  motion,
} from "framer-motion";

import {
  FiArrowRight,
  FiBookOpen,
  FiBriefcase,
  FiCreditCard,
  FiFileText,
  FiSearch,
  FiSend,
  FiShield,
  FiUsers,
  FiX,
} from "react-icons/fi";

import { Button } from "@/components/ui/button";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { ProtectedRoute } from "@/components/ProtectedRoute";

import {
  Document,
  Page,
  pdfjs,
} from "react-pdf";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

import {
  auth,
  db,
} from "@/src/firebase/firebase";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

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

type ManualCategory =
  | "Todos"
  | "Benefícios"
  | "Políticas"
  | "Normas"
  | "Procedimentos";

type ItemCategory = Exclude<
  ManualCategory,
  "Todos"
>;

type ManualItem = {
  title: string;
  description: string;
  slug: string;
  icon: ReactNode;
  category: ItemCategory;
  file?: string;
  dynamicContent?: "beneficios";
};

/* ============================================================
   CATEGORIAS
============================================================ */

const categories: ManualCategory[] = [
  "Todos",
  "Benefícios",
  "Políticas",
  "Normas",
  "Procedimentos",
];

/* ============================================================
   CONTEÚDOS
============================================================ */

const manualData: ManualItem[] = [
  {
    title: "Benefícios e Férias",
    description:
      "Benefícios, férias, licenças e informações importantes para o colaborador.",
    slug: "beneficios-e-ferias",
    category: "Benefícios",
    icon: <FiBriefcase size={21} />,
    dynamicContent: "beneficios",
  },

  {
    title: "Política de Viagens",
    description:
      "Diretrizes corporativas para planejamento e realização de viagens a serviço da Projeta.",
    slug: "politica-de-viagens",
    category: "Políticas",
    file: "/pdfs/manual-colaborador/viagens.pdf",
    icon: <FiSend size={21} />,
  },

  {
    title: "Política de Adiantamento de Viagem",
    description:
      "Procedimentos para solicitação, utilização e prestação de contas de adiantamentos.",
    slug: "adiantamento-de-viagem",
    category: "Políticas",
    file: "/pdfs/manual-colaborador/adiantamento-de-viagem.pdf",
    icon: <FiBriefcase size={21} />,
  },

  {
    title: "Solicitação de Reembolso",
    description:
      "Orientações para solicitação e processamento de reembolsos de despesas corporativas.",
    slug: "solicitacao-de-reembolso",
    category: "Procedimentos",
    file: "/pdfs/manual-colaborador/solicitacao-de-reembolso.pdf",
    icon: <FiCreditCard size={21} />,
  },

  {
    title: "Código de Ética",
    description:
      "Diretrizes de conduta ética, integridade e boas práticas profissionais.",
    slug: "codigo_etica",
    category: "Normas",
    file: "/pdfs/manual-colaborador/codigo_etica.pdf",
    icon: <FiBookOpen size={21} />,
  },

  {
    title: "Regimento Interno",
    description:
      "Normas, responsabilidades e orientações para o funcionamento organizacional.",
    slug: "regimento_interno",
    category: "Normas",
    file: "/pdfs/manual-colaborador/regimento_interno.pdf",
    icon: <FiFileText size={21} />,
  },

  {
    title: "Política de Combate ao Assédio",
    description:
      "Orientações para prevenção, identificação e combate ao assédio no ambiente de trabalho.",
    slug: "combate_assedio",
    category: "Políticas",
    file: "/pdfs/manual-colaborador/combate_assedio.pdf",
    icon: <FiShield size={21} />,
  },

  {
    title: "Responsabilidade Social",
    description:
      "Princípios voltados ao compromisso social, respeito às pessoas e desenvolvimento sustentável.",
    slug: "responsabilidade_social",
    category: "Políticas",
    file: "/pdfs/manual-colaborador/responsabilidade_social.pdf",
    icon: <FiUsers size={21} />,
  },
];

/* ============================================================
   COMPONENTE
============================================================ */

export default function ManualPage() {
  const [
    selectedDocument,
    setSelectedDocument,
  ] = useState<ManualItem | null>(null);

  const [
    selectedContent,
    setSelectedContent,
  ] = useState<"beneficios" | null>(
    null
  );

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<ManualCategory>("Todos");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [numPages, setNumPages] =
    useState<number | null>(null);

  const [
    containerWidth,
    setContainerWidth,
  ] = useState(800);

  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const [
    isConfirming,
    setIsConfirming,
  ] = useState(false);

  const [
    jaConfirmado,
    setJaConfirmado,
  ] = useState(false);

  /* ============================================================
     FILTRO
  ============================================================ */

  const filteredItems = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return manualData.filter(
      (item) => {
        const categoryMatch =
          selectedCategory === "Todos" ||
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

  function clearFilters() {
    setSearchTerm("");
    setSelectedCategory("Todos");
  }

  /* ============================================================
     ID FIREBASE
  ============================================================ */

  const buildConfirmDocId = (
    uid: string,
    documentoSlug: string
  ) =>
    `${uid}__${encodeURIComponent(
      documentoSlug
    )}`;

  /* ============================================================
     RESPONSIVIDADE PDF
  ============================================================ */

  useEffect(() => {
    if (!selectedDocument) {
      return;
    }

    const updateWidth = () => {
      if (!containerRef.current) {
        return;
      }

      const availableWidth =
        containerRef.current
          .offsetWidth - 32;

      setContainerWidth(
        Math.min(
          Math.max(
            availableWidth,
            280
          ),
          1000
        )
      );
    };

    updateWidth();

    window.addEventListener(
      "resize",
      updateWidth
    );

    const observer =
      new ResizeObserver(updateWidth);

    if (containerRef.current) {
      observer.observe(
        containerRef.current
      );
    }

    return () => {
      window.removeEventListener(
        "resize",
        updateWidth
      );

      observer.disconnect();
    };
  }, [selectedDocument]);

  /* ============================================================
     CONFIRMAÇÃO FIREBASE
  ============================================================ */

  useEffect(() => {
    const checkConfirmacao =
      async () => {
        if (!selectedDocument) {
          return;
        }

        const user =
          auth.currentUser;

        if (!user) {
          return;
        }

        try {
          const docId =
            buildConfirmDocId(
              user.uid,
              selectedDocument.slug
            );

          const ref = doc(
            db,
            "confirmacoesLeitura",
            docId
          );

          const snap =
            await getDoc(ref);

          setJaConfirmado(
            snap.exists()
          );
        } catch (error) {
          console.error(
            "Erro ao verificar confirmação:",
            error
          );

          setJaConfirmado(false);
        }
      };

    setJaConfirmado(false);
    setNumPages(null);

    checkConfirmacao();
  }, [selectedDocument]);

  /* ============================================================
     BLOQUEIA FUNDO
  ============================================================ */

  useEffect(() => {
    if (
      selectedDocument ||
      selectedContent
    ) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [
    selectedDocument,
    selectedContent,
  ]);

  /* ============================================================
     FECHAR PDF
  ============================================================ */

  function closeDocument() {
    setSelectedDocument(null);
    setNumPages(null);
    setJaConfirmado(false);
    setIsConfirming(false);
  }

  /* ============================================================
     ABRIR ITEM
  ============================================================ */

  function handleOpenItem(
    item: ManualItem
  ) {
    if (
      item.dynamicContent ===
      "beneficios"
    ) {
      setSelectedContent(
        "beneficios"
      );

      return;
    }

    setSelectedDocument(item);
  }

  /* ============================================================
     CONFIRMAR LEITURA
  ============================================================ */

  async function handleConfirmAccess() {
    if (!selectedDocument) {
      return;
    }

    try {
      setIsConfirming(true);

      const user =
        auth.currentUser;

      if (!user) {
        alert(
          "Sessão expirada. Faça login novamente."
        );

        return;
      }

      if (jaConfirmado) {
        closeDocument();
        return;
      }

      const confirmDocId =
        buildConfirmDocId(
          user.uid,
          selectedDocument.slug
        );

      const confirmRef = doc(
        db,
        "confirmacoesLeitura",
        confirmDocId
      );

      const existing =
        await getDoc(confirmRef);

      if (existing.exists()) {
        setJaConfirmado(true);
        closeDocument();
        return;
      }

      let nome =
        user.displayName ?? "";

      let email =
        user.email ?? "";

      try {
        const userRef = doc(
          db,
          "users",
          user.uid
        );

        const userSnap =
          await getDoc(userRef);

        if (userSnap.exists()) {
          const data =
            userSnap.data();

          nome =
            data.nome ?? nome;

          email =
            data.email ?? email;
        }
      } catch (error) {
        console.warn(
          "Não foi possível ler users/{uid}. Usando dados do Auth.",
          error
        );
      }

      await setDoc(
        confirmRef,
        {
          uid: user.uid,
          nome,
          email,

          documentoSlug:
            selectedDocument.slug,

          documentoTitulo:
            selectedDocument.title,

          documentoArquivo:
            selectedDocument.file ??
            null,

          pagina:
            "Manual do Colaborador",

          acessadoEm:
            serverTimestamp(),

          userAgent:
            typeof window !==
            "undefined"
              ? window.navigator
                  .userAgent
              : null,

          pagePath:
            typeof window !==
            "undefined"
              ? window.location
                  .pathname
              : "",
        },
        {
          merge: true,
        }
      );

      closeDocument();
    } catch (error) {
      console.error(
        "Erro ao registrar leitura:",
        error
      );

      alert(
        "Não foi possível registrar o acesso. Tente novamente."
      );
    } finally {
      setIsConfirming(false);
    }
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
            {/* DETALHE */}

            <div className="absolute left-0 top-0 h-full w-[4px] bg-[#AF1B1B]" />

            <div className="px-5 py-5 sm:px-7 sm:py-6 lg:px-8">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#AF1B1B] sm:text-[11px]">
                    Biblioteca Corporativa
                  </p>

                  <h1 className="mt-1 text-2xl font-black tracking-tight text-[#171717] sm:text-3xl">
                    Manual do Colaborador
                  </h1>

                  <p className="mt-2 text-[13px] leading-5 text-gray-500 sm:text-sm sm:leading-6">
                    Encontre políticas,
                    benefícios, normas e
                    orientações importantes
                    para sua rotina na
                    Projeta.
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <div className="h-2 w-2 rounded-full bg-[#AF1B1B]" />

                  <span>
                    {
                      manualData.length
                    }{" "}
                    conteúdos disponíveis
                  </span>
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
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#AF1B1B]">
                  Conteúdos
                </p>

                <h2 className="text-lg font-bold text-[#171717] sm:text-xl">
                  Informações para o
                  colaborador
                </h2>

                <p className="text-xs text-gray-500">
                  Localize rapidamente o
                  conteúdo que você
                  precisa.
                </p>
              </div>

              {/* =================================================
                  BUSCA
              ================================================= */}

              <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm sm:p-4">
                <div className="relative">
                  <FiSearch className="pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 text-gray-400" />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(
                      event
                    ) =>
                      setSearchTerm(
                        event.target
                          .value
                      )
                    }
                    placeholder="Buscar política, benefício ou procedimento..."
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
                      <FiX size={15} />
                    </button>
                  )}
                </div>

                {/* ===============================================
                    FILTROS
                =============================================== */}

                <div className="mt-3 flex flex-wrap gap-2">
                  {categories.map(
                    (
                      category
                    ) => {
                      const active =
                        selectedCategory ===
                        category;

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
                            min-h-[34px]
                            rounded-lg
                            border
                            px-3
                            text-[11px]
                            font-semibold
                            transition-all
                            duration-200

                            ${
                              active
                                ? "border-[#AF1B1B] bg-[#AF1B1B] text-white shadow-sm"
                                : "border-gray-200 bg-white text-gray-500 hover:border-[#AF1B1B]/30 hover:bg-[#AF1B1B]/5 hover:text-[#AF1B1B]"
                            }
                          `}
                        >
                          {category}
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
                <motion.div
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: 1,
                  }}
                  className="mt-3 flex items-center justify-between gap-3"
                >
                  <p className="text-[11px] text-gray-500">
                    <strong className="font-semibold text-gray-700">
                      {
                        filteredItems.length
                      }
                    </strong>{" "}
                    {filteredItems.length ===
                    1
                      ? "conteúdo encontrado"
                      : "conteúdos encontrados"}
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
                </motion.div>
              )}

              {/* =================================================
                  GRID
              ================================================= */}

              {filteredItems.length >
              0 ? (
                <motion.div
                  layout
                  className="
                    mt-4
                    grid
                    grid-cols-1
                    gap-3

                    md:grid-cols-2

                    xl:grid-cols-3
                  "
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
                            duration: 0.25,
                            delay:
                              index *
                              0.025,
                          }}
                          type="button"
                          onClick={() =>
                            handleOpenItem(
                              item
                            )
                          }
                          className="
                            group
                            relative
                            flex
                            min-h-[145px]
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
                            {/* ÍCONE */}

                            <div
                              className="
                                flex
                                h-10
                                w-10
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-[#AF1B1B]/8
                                text-[#AF1B1B]
                                transition-all
                                duration-200

                                group-hover:scale-105
                                group-hover:bg-[#AF1B1B]/12
                              "
                            >
                              {
                                item.icon
                              }
                            </div>

                            {/* CONTEÚDO */}

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
                              className="
                                mt-1
                                shrink-0
                                text-gray-300
                                transition-all
                                duration-200

                                group-hover:translate-x-1
                                group-hover:text-[#AF1B1B]
                              "
                              size={
                                16
                              }
                            />
                          </div>

                          {/* RODAPÉ */}

                          <div className="mt-auto pt-4">
                            <span
                              className="
                                inline-flex
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
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.98,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  className="mt-4 flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-center"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
                    <FiSearch className="text-gray-400" />
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-gray-900">
                    Nenhum conteúdo
                    encontrado
                  </h3>

                  <p className="mt-1 text-xs text-gray-500">
                    Tente utilizar outro
                    termo ou categoria.
                  </p>

                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="mt-3 text-xs font-semibold text-[#AF1B1B]"
                  >
                    Limpar pesquisa
                  </button>
                </motion.div>
              )}
            </motion.div>
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
            Projeta • Sistema Interno
            Corporativo
          </footer>
        </div>

        {/* =====================================================
            PDF MODAL
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
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 sm:p-3"
              role="dialog"
              aria-modal="true"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="flex h-[100dvh] w-full flex-col overflow-hidden bg-white sm:h-[95vh] sm:max-w-7xl sm:rounded-2xl sm:shadow-2xl"
              >
                {/* HEADER */}

                <div className="flex min-h-[62px] shrink-0 items-center justify-between border-b border-gray-200 px-4 sm:px-5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#AF1B1B]">
                      {
                        selectedDocument.category
                      }
                    </p>

                    <h2 className="mt-0.5 text-sm font-bold text-[#171717] sm:text-base">
                      {
                        selectedDocument.title
                      }
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={
                      closeDocument
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:bg-[#AF1B1B] hover:text-white"
                  >
                    <FiX
                      size={16}
                    />
                  </button>
                </div>

                {/* PDF */}

                <div
                  ref={
                    containerRef
                  }
                  className="min-h-0 flex-1 overflow-auto bg-[#EAEAEA] p-2 sm:p-4"
                >
                  <Document
                    file={
                      selectedDocument.file
                    }
                    onLoadSuccess={({
                      numPages,
                    }) =>
                      setNumPages(
                        numPages
                      )
                    }
                    loading={
                      <div className="flex min-h-[300px] items-center justify-center">
                        <div className="text-center">
                          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[#AF1B1B]" />

                          <p className="mt-3 text-xs text-gray-500">
                            Carregando
                            documento...
                          </p>
                        </div>
                      </div>
                    }
                    error={
                      <div className="flex min-h-[300px] items-center justify-center text-center">
                        <div>
                          <p className="text-sm font-semibold text-red-600">
                            Não foi
                            possível
                            carregar o
                            documento.
                          </p>

                          <p className="mt-1 text-xs text-gray-500">
                            Verifique se
                            o arquivo está
                            disponível.
                          </p>
                        </div>
                      </div>
                    }
                    className="flex flex-col items-center gap-3"
                  >
                    {Array.from(
                      {
                        length:
                          numPages ??
                          0,
                      },
                      (
                        _,
                        index
                      ) => (
                        <Page
                          key={`page_${
                            index +
                            1
                          }`}
                          pageNumber={
                            index +
                            1
                          }
                          renderTextLayer={
                            false
                          }
                          renderAnnotationLayer={
                            false
                          }
                          width={
                            containerWidth
                          }
                          className="overflow-hidden bg-white shadow-md"
                        />
                      )
                    )}
                  </Document>
                </div>

                {/* CONFIRMAÇÃO */}

                <div className="shrink-0 border-t border-gray-200 bg-white p-3 sm:p-4">
                  <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[12px] font-bold text-gray-800">
                        {jaConfirmado
                          ? "Documento já confirmado"
                          : "Confirmar leitura"}
                      </p>

                      <p className="mt-0.5 text-[10px] leading-4 text-gray-500 sm:text-[11px]">
                        {jaConfirmado
                          ? "Sua leitura já foi registrada anteriormente."
                          : "Ao confirmar, seu acesso será registrado no monitoramento interno."}
                      </p>
                    </div>

                    <Button
                      type="button"
                      onClick={
                        handleConfirmAccess
                      }
                      disabled={
                        isConfirming
                      }
                      className="h-10 shrink-0 cursor-pointer rounded-lg bg-[#AF1B1B] px-5 text-xs font-semibold text-white hover:bg-[#8C1616] disabled:opacity-60"
                    >
                      {isConfirming
                        ? "Processando..."
                        : jaConfirmado
                          ? "Fechar"
                          : "Confirmar leitura"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* =====================================================
            BENEFÍCIOS MODAL
        ===================================================== */}

        <AnimatePresence>
          {selectedContent ===
            "beneficios" && (
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
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4"
            >
              <motion.div
                initial={{
                  opacity: 0,
                  y: 18,
                  scale: 0.98,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.98,
                }}
                className="relative h-[100dvh] w-full overflow-y-auto bg-white px-4 pb-8 pt-5 sm:h-[90vh] sm:max-w-3xl sm:rounded-2xl sm:p-8 sm:shadow-2xl"
              >
                {/* HEADER */}

                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#AF1B1B]">
                      Manual do
                      Colaborador
                    </p>

                    <h2 className="mt-1 text-2xl font-black text-[#171717] sm:text-3xl">
                      Benefícios e Férias
                    </h2>

                    <p className="mt-1.5 text-xs leading-5 text-gray-500 sm:text-sm">
                      Consulte os
                      benefícios
                      disponíveis e as
                      principais
                      orientações sobre
                      férias.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedContent(
                        null
                      )
                    }
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-400 transition hover:bg-[#AF1B1B] hover:text-white"
                  >
                    <FiX
                      size={16}
                    />
                  </button>
                </div>

                <Accordion
                  type="single"
                  collapsible
                  className="w-full space-y-3"
                  defaultValue="flash"
                >
                  {/* =============================================
                      ALIMENTAÇÃO
                  ============================================= */}

                  <AccordionItem
                    value="flash"
                    className="overflow-hidden rounded-xl border border-gray-200 px-4"
                  >
                    <AccordionTrigger className="cursor-pointer text-sm font-semibold text-[#AF1B1B] hover:no-underline sm:text-base">
                      Alimentação
                    </AccordionTrigger>

                    <AccordionContent className="flex flex-col gap-4 pb-5">
                      <p className="text-[13px] leading-6 text-[#333] sm:text-sm">
                        A{" "}
                        <strong>
                          Projeta
                        </strong>{" "}
                        oferece aos
                        colaboradores o
                        benefício de
                        Cesta Básica,
                        disponibilizado
                        por meio da{" "}
                        <strong>
                          Plataforma
                          Flash Benefícios
                        </strong>
                        , garantindo
                        praticidade,
                        transparência e
                        autonomia na
                        gestão dos
                        créditos. As
                        cestas são
                        entregues na 2ª
                        quarta-feira de
                        cada mês,
                        conforme
                        calendário
                        interno.
                      </p>

                      <p className="text-[13px] leading-6 text-[#333] sm:text-sm">
                        O{" "}
                        <strong>
                          cartão Flash
                        </strong>{" "}
                        funciona como um
                        cartão pré-pago,
                        sendo aceito em
                        diversos
                        estabelecimentos
                        físicos e online
                        em todo o Brasil.
                      </p>

                      <Image
                        src="/images/beneficios/flash1.png"
                        alt="Parceiros Flash"
                        width={
                          300
                        }
                        height={
                          250
                        }
                        className="mx-auto h-auto max-w-full rounded-lg shadow-sm"
                      />

                      <div className="text-center">
                        <h3 className="text-sm font-semibold text-[#AF1B1B]">
                          Parceiros
                        </h3>

                        <ul className="mt-3 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[13px] text-gray-600">
                          <li>
                            MC
                            Donald&apos;s
                          </li>
                          <li>
                            Carrefour
                          </li>
                          <li>
                            Salú
                          </li>
                          <li>
                            Oracle
                          </li>
                          <li>
                            Globoplay
                          </li>
                          <li>
                            ePharma
                          </li>
                          <li>
                            Allu
                          </li>
                          <li>
                            ClickBus
                          </li>
                          <li>
                            Localiza
                          </li>
                          <li>
                            Insider
                          </li>
                          <li>
                            Americanas
                          </li>
                          <li>
                            Cinemark
                          </li>
                          <li>
                            Uber
                          </li>
                          <li>
                            AWS
                          </li>
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  {/* =============================================
                      VALE TRANSPORTE
                  ============================================= */}

                  <AccordionItem
                    value="vale-transporte"
                    className="overflow-hidden rounded-xl border border-gray-200 px-4"
                  >
                    <AccordionTrigger className="cursor-pointer text-sm font-semibold text-[#AF1B1B] hover:no-underline sm:text-base">
                      Vale Transporte
                    </AccordionTrigger>

                    <AccordionContent className="flex flex-col gap-4 pb-5">
                      <p className="text-[13px] leading-6 text-[#333] sm:text-sm">
                        Benefício
                        concedido aos
                        colaboradores
                        para custeio do
                        deslocamento
                        residência–
                        trabalho e
                        trabalho–
                        residência, em
                        conformidade com
                        a legislação
                        vigente (Lei nº
                        7.418/1985). O
                        desconto aplicado
                        é de 6% sobre o
                        salário base ou
                        conforme disposto
                        na Convenção
                        Coletiva de
                        Trabalho
                        aplicável.
                      </p>

                      <Image
                        src="/images/beneficios/vale_transporte.png"
                        alt="Vale Transporte"
                        width={
                          400
                        }
                        height={
                          250
                        }
                        className="mx-auto h-auto max-w-full rounded-lg shadow-sm"
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* =============================================
                      PLANO DE SAÚDE
                  ============================================= */}

                  <AccordionItem
                    value="hapvida"
                    className="overflow-hidden rounded-xl border border-gray-200 px-4"
                  >
                    <AccordionTrigger className="cursor-pointer text-sm font-semibold text-[#AF1B1B] hover:no-underline sm:text-base">
                      Plano de Saúde
                    </AccordionTrigger>

                    <AccordionContent className="space-y-4 pb-5">
                      <p className="text-[13px] leading-6 text-[#333] sm:text-sm">
                        A Projeta oferece
                        o Plano de Saúde
                        Hapvida, com
                        custo
                        compartilhado
                        entre empresa
                        (50%) e
                        colaborador
                        (50%) para o
                        titular. A
                        inclusão de
                        dependentes é
                        opcional, sendo o
                        custeio integral
                        de
                        responsabilidade
                        do colaborador.
                      </p>

                      <Image
                        src="/images/beneficios/hapvida_plano.png"
                        alt="Plano de Saúde Hapvida"
                        width={
                          500
                        }
                        height={
                          250
                        }
                        className="mx-auto h-auto max-w-full rounded-lg shadow-sm"
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* =============================================
                      SEGURO DE VIDA
                  ============================================= */}

                  <AccordionItem
                    value="icatu"
                    className="overflow-hidden rounded-xl border border-gray-200 px-4"
                  >
                    <AccordionTrigger className="cursor-pointer text-sm font-semibold text-[#AF1B1B] hover:no-underline sm:text-base">
                      Seguro de Vida
                    </AccordionTrigger>

                    <AccordionContent className="space-y-4 pb-5">
                      <p className="text-[13px] leading-6 text-[#333] sm:text-sm">
                        A Projeta
                        disponibiliza o
                        Seguro de Vida
                        Icatu Seguros a
                        todos os
                        colaboradores,
                        sem desconto em
                        folha, garantindo
                        proteção
                        financeira nos
                        eventos cobertos
                        pela apólice.
                      </p>

                      <Image
                        src="/images/beneficios/icatu_seguros_banner.jpg"
                        alt="Seguro de Vida Icatu"
                        width={
                          800
                        }
                        height={
                          250
                        }
                        className="mx-auto h-auto max-w-full rounded-lg shadow-sm"
                      />
                    </AccordionContent>
                  </AccordionItem>

                  {/* =============================================
                      FÉRIAS
                  ============================================= */}

                  <AccordionItem
                    value="ferias"
                    className="overflow-hidden rounded-xl border border-gray-200 px-4"
                  >
                    <AccordionTrigger className="cursor-pointer text-sm font-semibold text-[#AF1B1B] hover:no-underline sm:text-base">
                      Férias
                    </AccordionTrigger>

                    <AccordionContent className="pb-5">
                      <div className="space-y-5">
                        <p className="text-[13px] leading-6 text-[#333] sm:text-sm">
                          As férias
                          constituem um
                          direito
                          trabalhista
                          destinado ao
                          descanso e à
                          recuperação
                          física e mental
                          do colaborador
                          após o período
                          aquisitivo.
                        </p>

                        <ul className="list-disc space-y-2 pl-5 text-[13px] leading-6 text-[#333] sm:text-sm">
                          <li>
                            30 dias após
                            12 meses de
                            trabalho.
                          </li>

                          <li>
                            Concessão até
                            12 meses após
                            o período
                            aquisitivo.
                          </li>

                          <li>
                            Possibilidade
                            de férias
                            coletivas.
                          </li>

                          <li>
                            Notificação
                            via app do
                            ponto.
                          </li>

                          <li>
                            Abono
                            pecuniário de
                            até 1/3 das
                            férias.
                          </li>

                          <li>
                            Fracionamento
                            em até 3
                            períodos.
                          </li>

                          <li>
                            Pagamento até
                            2 dias antes
                            do início.
                          </li>
                        </ul>

                        <Image
                          src="/images/beneficios/ferias.jpg"
                          alt="Férias"
                          width={
                            500
                          }
                          height={
                            250
                          }
                          className="mx-auto h-auto max-w-full rounded-lg shadow-sm"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  );
}