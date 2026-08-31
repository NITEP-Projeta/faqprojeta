"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { motion } from "framer-motion";

import {
  FiBookOpen,
  FiBriefcase,
  FiFileText,
  FiX,
} from "react-icons/fi";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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

type Diretriz = {
  title: string;
  description: string;
  slug: string;
  file: string;
  code?: string;
  revision?: string;
  icon: React.ReactNode;
};

/* ============================================================
   DOCUMENTOS
============================================================ */

const diretrizesData: Diretriz[] = [
  {
    title: "Regimento Interno",
    description:
      "Conjunto de regras e diretrizes que orientam o funcionamento interno da empresa.",
    slug: "regimento-interno",
    file: "/pdfs/regimento-interno/regimento-interno.pdf",
    icon: <FiBookOpen size={24} />,
  },
  {
    title: "Política de Viagens",
    description:
      "Diretrizes corporativas para planejamento, realização e controle de viagens a serviço da Projeta.",
    slug: "politica-de-viagens",
    file: "/pdfs/diretrizes-internas/IT_25_Politica_de_Viagens_Rev00.pdf",
    code: "IT_25",
    revision: "Rev00",
    icon: <FiBriefcase size={24} />,
  },
];

export default function DiretrizesInternasPage() {
  const [selectedDocument, setSelectedDocument] =
    useState<Diretriz | null>(null);

  const [numPages, setNumPages] =
    useState<number | null>(null);

  const [containerWidth, setContainerWidth] =
    useState(800);

  const containerRef =
    useRef<HTMLDivElement | null>(null);

  const [isConfirming, setIsConfirming] =
    useState(false);

  const [jaConfirmado, setJaConfirmado] =
    useState(false);

  /* ============================================================
     ID DA CONFIRMAÇÃO
  ============================================================ */

  const buildConfirmDocId = (
    uid: string,
    documentoSlug: string
  ) =>
    `${uid}__${encodeURIComponent(
      documentoSlug
    )}`;

  /* ============================================================
     PDF RESPONSIVO
  ============================================================ */

  useEffect(() => {
    if (!selectedDocument) return;

    const updateWidth = () => {
      if (containerRef.current) {
        const width =
          containerRef.current.offsetWidth - 32;

        setContainerWidth(
          Math.min(width, 1000)
        );
      }
    };

    updateWidth();

    window.addEventListener(
      "resize",
      updateWidth
    );

    const observer = new ResizeObserver(
      updateWidth
    );

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
     VERIFICA CONFIRMAÇÃO
  ============================================================ */

  useEffect(() => {
    const checkConfirmacao = async () => {
      if (!selectedDocument) return;

      const user = auth.currentUser;

      if (!user) return;

      try {
        const docId = buildConfirmDocId(
          user.uid,
          selectedDocument.slug
        );

        const ref = doc(
          db,
          "confirmacoesLeitura",
          docId
        );

        const snap = await getDoc(ref);

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
     BLOQUEIA SCROLL DO FUNDO
  ============================================================ */

  useEffect(() => {
    if (selectedDocument) {
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
  }, [selectedDocument]);

  /* ============================================================
     FECHAR MODAL
  ============================================================ */

  function closeDocument() {
    setSelectedDocument(null);
    setNumPages(null);
    setJaConfirmado(false);
  }

  /* ============================================================
     CONFIRMAÇÃO
  ============================================================ */

  const handleConfirmAccess =
    async () => {
      if (!selectedDocument) return;

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

        /* =========================================
           JÁ CONFIRMADO
        ========================================= */

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

        /* =========================================
           DOUBLE-CHECK
        ========================================= */

        const existing =
          await getDoc(confirmRef);

        if (existing.exists()) {
          setJaConfirmado(true);
          closeDocument();
          return;
        }

        /* =========================================
           DADOS DO USUÁRIO
        ========================================= */

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

        /* =========================================
           REGISTRA LEITURA
        ========================================= */

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

            documentoCodigo:
              selectedDocument.code ??
              null,

            documentoRevisao:
              selectedDocument.revision ??
              null,

            pagina:
              "Diretrizes Internas",

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

        setJaConfirmado(true);

        closeDocument();
      } catch (error) {
        console.error(error);

        alert(
          "Não foi possível registrar o acesso. Tente novamente."
        );
      } finally {
        setIsConfirming(false);
      }
    };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#F5F5F5]">
        <div className="mx-auto w-full max-w-[1450px] px-3 py-4 sm:px-5 sm:py-5 lg:px-7">
          {/* =====================================================
              CABEÇALHO
          ===================================================== */}

          <motion.header
            initial={{
              opacity: 0,
              y: 14,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
            }}
            className="
              overflow-hidden
              rounded-2xl
              border
              border-gray-200
              bg-white
              shadow-sm
            "
          >
            <div className="px-5 py-5 sm:px-7 sm:py-6 lg:px-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#AF1B1B] sm:text-[11px]">
                Biblioteca Corporativa
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight text-[#171717] sm:text-3xl">
                Diretrizes Internas
              </h1>

              <p className="mt-2 max-w-3xl text-[13px] leading-5 text-gray-500 sm:text-sm sm:leading-6">
                Consulte as políticas,
                normas e diretrizes
                corporativas para garantir
                alinhamento, ética e
                segurança nas atividades da
                Projeta.
              </p>
            </div>
          </motion.header>

          {/* =====================================================
              DOCUMENTOS
          ===================================================== */}

          <section className="mt-5 sm:mt-6">
            <div className="mb-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#AF1B1B]">
                Documentos
              </p>

              <h2 className="mt-1 text-lg font-bold text-[#171717] sm:text-xl">
                Diretrizes disponíveis
              </h2>
            </div>

            <motion.div
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              transition={{
                duration: 0.4,
                delay: 0.1,
              }}
              className="
                grid
                grid-cols-1
                gap-3

                sm:grid-cols-2
                sm:gap-4

                xl:grid-cols-3
              "
            >
              {diretrizesData.map(
                (item, index) => (
                  <motion.div
                    key={item.slug}
                    initial={{
                      opacity: 0,
                      y: 14,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.4,
                      delay:
                        0.12 +
                        index * 0.07,
                    }}
                  >
                    <Card
                      className="
                        group
                        flex
                        h-full
                        flex-col
                        overflow-hidden
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        shadow-sm
                        transition-all
                        duration-200

                        hover:-translate-y-1
                        hover:border-[#AF1B1B]/30
                        hover:shadow-md
                      "
                    >
                      {/* LINHA SUPERIOR */}

                      <div className="h-[3px] w-full bg-[#AF1B1B]" />

                      <CardHeader className="flex-1 p-5">
                        <div className="mb-4 flex items-start justify-between gap-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#AF1B1B]/10 text-[#AF1B1B] transition-transform duration-200 group-hover:scale-105">
                            {item.icon}
                          </div>

                          {(item.code ||
                            item.revision) && (
                            <div className="flex flex-wrap justify-end gap-1.5">
                              {item.code && (
                                <span className="rounded-md bg-[#AF1B1B]/10 px-2 py-1 text-[10px] font-bold text-[#AF1B1B]">
                                  {
                                    item.code
                                  }
                                </span>
                              )}

                              {item.revision && (
                                <span className="rounded-md bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-500">
                                  {
                                    item.revision
                                  }
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <CardTitle className="text-[15px] font-bold text-[#171717] sm:text-base">
                          {item.title}
                        </CardTitle>

                        <CardDescription className="mt-1.5 text-[12px] leading-5 text-gray-500">
                          {
                            item.description
                          }
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="border-t border-gray-100 p-4">
                        <Button
                          onClick={() =>
                            setSelectedDocument(
                              item
                            )
                          }
                          className="
                            flex
                            h-10
                            w-full
                            cursor-pointer
                            items-center
                            justify-center
                            gap-2
                            rounded-lg
                            bg-[#AF1B1B]
                            text-xs
                            font-semibold
                            text-white
                            transition-all
                            duration-200

                            hover:bg-[#8C1616]
                            hover:shadow-md
                            active:scale-[0.98]
                          "
                        >
                          <FiFileText
                            size={15}
                          />

                          Visualizar documento
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
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
            MODAL PDF
        ===================================================== */}

        {selectedDocument && (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/75

              sm:p-3
            "
          >
            <motion.div
              initial={{
                opacity: 0,
                y: 16,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
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
                bg-white

                sm:h-[95vh]
                sm:max-w-7xl
                sm:rounded-2xl
                sm:shadow-2xl
              "
            >
              {/* =================================================
                  HEADER MODAL
              ================================================= */}

              <div className="flex min-h-[64px] shrink-0 items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 sm:px-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {selectedDocument.code && (
                      <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#AF1B1B]">
                        {
                          selectedDocument.code
                        }
                      </span>
                    )}

                    {selectedDocument.revision && (
                      <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-gray-400">
                        {
                          selectedDocument.revision
                        }
                      </span>
                    )}
                  </div>

                  <h2 className="truncate text-sm font-bold text-[#171717] sm:text-base">
                    {
                      selectedDocument.title
                    }
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={closeDocument}
                  aria-label="Fechar documento"
                  className="
                    flex
                    h-9
                    w-9
                    shrink-0
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-lg
                    border
                    border-gray-200
                    text-gray-400
                    transition

                    hover:bg-[#AF1B1B]
                    hover:text-white
                  "
                >
                  <FiX size={17} />
                </button>
              </div>

              {/* =================================================
                  PDF
              ================================================= */}

              <div
                ref={containerRef}
                className="
                  min-h-0
                  flex-1
                  overflow-auto
                  bg-[#EAEAEA]
                  p-2

                  sm:p-4
                "
              >
                <Document
                  file={
                    selectedDocument.file
                  }
                  onLoadSuccess={({
                    numPages,
                  }) =>
                    setNumPages(numPages)
                  }
                  loading={
                    <div className="flex min-h-[300px] items-center justify-center">
                      <p className="text-sm text-gray-500">
                        Carregando
                        documento...
                      </p>
                    </div>
                  }
                  error={
                    <div className="flex min-h-[300px] items-center justify-center text-center">
                      <div>
                        <p className="text-sm font-semibold text-red-600">
                          Não foi possível
                          carregar o
                          documento.
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          Verifique se o
                          arquivo PDF está
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
                        numPages ?? 0,
                    },
                    (_, index) => (
                      <Page
                        key={`page_${
                          index + 1
                        }`}
                        pageNumber={
                          index + 1
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
                        className="overflow-hidden shadow-md"
                      />
                    )
                  )}
                </Document>
              </div>

              {/* =================================================
                  CONFIRMAÇÃO
              ================================================= */}

              <div className="shrink-0 border-t border-gray-200 bg-white p-3 sm:p-4">
                <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[12px] font-bold text-gray-800 sm:text-[13px]">
                      {jaConfirmado
                        ? "Documento já confirmado"
                        : "Confirmar leitura"}
                    </p>

                    <p className="mt-0.5 text-[10px] leading-4 text-gray-500 sm:text-[11px]">
                      {jaConfirmado
                        ? "Sua leitura deste documento já foi registrada anteriormente."
                        : "Ao confirmar, seu acesso será registrado no monitoramento interno."}
                    </p>
                  </div>

                  <Button
                    onClick={
                      handleConfirmAccess
                    }
                    disabled={
                      isConfirming
                    }
                    className="
                      h-10
                      shrink-0
                      cursor-pointer
                      rounded-lg
                      bg-[#AF1B1B]
                      px-5
                      text-xs
                      font-semibold
                      text-white

                      hover:bg-[#8C1616]

                      disabled:cursor-not-allowed
                      disabled:opacity-60
                    "
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
      </div>
    </ProtectedRoute>
  );
}