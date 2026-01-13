"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FiBookOpen } from "react-icons/fi";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

import { auth, db } from "@/src/firebase/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

// Configuração obrigatória do worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const diretrizesData = [
  {
    title: "Regimento Interno",
    description: "Conjunto de regras e diretrizes que orientam o funcionamento interno da empresa.",
    slug: "regimento-interno",
    icon: <FiBookOpen size={28} />,
  },
];

export default function DiretrizesInternasPage() {
  const [pdfSlug, setPdfSlug] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ✅ Estado para evitar cliques duplicados
  const [isConfirming, setIsConfirming] = useState(false);

  // ✅ Controle para não permitir confirmação duplicada
  const [jaConfirmado, setJaConfirmado] = useState(false);

  const buildConfirmDocId = (uid: string, documentoSlug: string) =>
    `${uid}__${encodeURIComponent(documentoSlug)}`;

  // ✅ Recalcula largura do PDF quando modal abre/resize
  useEffect(() => {
    if (!pdfSlug) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 32);
      }
    };

    window.addEventListener("resize", updateWidth);

    const observer = new MutationObserver(updateWidth);
    observer.observe(document.body, { childList: true, subtree: true });

    const timeout = setTimeout(updateWidth, 100);

    return () => {
      window.removeEventListener("resize", updateWidth);
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [pdfSlug]);

  // ✅ Sempre que abrir/trocar o PDF, verifica se já confirmou
  useEffect(() => {
    const checkConfirmacao = async () => {
      if (!pdfSlug) return;

      const user = auth.currentUser;
      if (!user) return;

      try {
        const docId = buildConfirmDocId(user.uid, pdfSlug);
        const ref = doc(db, "confirmacoesLeitura", docId);
        const snap = await getDoc(ref);
        setJaConfirmado(snap.exists());
      } catch (e) {
        console.error("Erro ao verificar confirmação:", e);
        setJaConfirmado(false);
      }
    };

    checkConfirmacao();
  }, [pdfSlug]);

  const handleConfirmAccess = async () => {
    if (!pdfSlug) return;

    try {
      setIsConfirming(true);

      const user = auth.currentUser;
      if (!user) {
        alert("Sessão expirada. Faça login novamente.");
        return;
      }

      // ✅ Se já confirmou, vira apenas FECHAR (não registra novamente)
      if (jaConfirmado) {
        setPdfSlug(null);
        return;
      }

      // ✅ ID fixo => não duplica
      const confirmDocId = buildConfirmDocId(user.uid, pdfSlug);
      const confirmRef = doc(db, "confirmacoesLeitura", confirmDocId);

      // Double-check: se existir, não cria
      const existing = await getDoc(confirmRef);
      if (existing.exists()) {
        setJaConfirmado(true);
        setPdfSlug(null);
        return;
      }

      // ✅ Busca nome/email do users/{uid} (seu cadastro cria docId = uid)
      let nome = user.displayName ?? "";
      let email = user.email ?? "";

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data() as any;
          nome = data.nome ?? nome;
          email = data.email ?? email;
        }
      } catch (e) {
        // fallback com dados do auth
        console.warn("Não foi possível ler users/{uid}. Usando dados do Auth.", e);
      }

      // ✅ Registra uma única vez
      await setDoc(confirmRef, {
        uid: user.uid,
        nome,
        email,
        documentoSlug: pdfSlug,
        pagina: "Diretrizes Internas",
        acessadoEm: serverTimestamp(),
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : null,
        pagePath: typeof window !== "undefined" ? window.location.pathname : "",
      });

      setJaConfirmado(true);
      setPdfSlug(null);
    } catch (error) {
      console.error(error);
      alert("Não foi possível registrar o acesso. Tente novamente.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-between min-h-screen bg-[#F8F8F8] gap-8 p-6">
        {/* Header */}
        <div className="w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">
              Regimento <span className="text-[#AF1B1B]">Interno</span>
            </h1>
            <div className="w-28 h-1 bg-[#AF1B1B] mx-auto rounded"></div>
            <p className="text-[#555] mt-3">
              Consulte as diretrizes corporativas para garantir alinhamento, ética e segurança em nossas operações.
            </p>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {diretrizesData.map((item) => (
              <Card
                key={item.slug}
                className="relative bg-white border-l-4 shadow-sm hover:shadow-xl transition-transform transform hover:-translate-y-1 rounded-md p-4 flex flex-col items-center text-center"
              >
                <div className="mb-3 text-[#AF1B1B]">{item.icon}</div>
                <CardHeader className="flex flex-col items-center justify-center space-y-2 w-full">
                  <CardTitle className="text-lg font-semibold text-[#1A1A1A]">{item.title}</CardTitle>
                  <CardDescription className="text-sm text-[#555]">{item.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center mt-2">
                  <Button
                    onClick={() => setPdfSlug(item.slug)}
                    className="px-5 py-2 bg-[#AF1B1B] text-white rounded-md cursor-pointer hover:bg-[#8C1616] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-7xl">
          <p className="text-center text-sm text-[#7A7A7A] py-4">
            © {new Date().getFullYear()} Projeta • Sistema Interno Corporativo
          </p>
        </div>

        {/* Modal PDF */}
        {pdfSlug && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4">
            <div className="relative w-full max-w-7xl h-[95vh] bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
              <div ref={containerRef} className="overflow-auto p-4 flex-1 bg-white">
                <Document
                  file={`/pdfs/regimento-interno/${pdfSlug}.pdf`}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={<p className="text-center text-gray-500 mt-10">Carregando documento...</p>}
                  className="flex flex-col items-center"
                >
                  {Array.from(new Array(numPages ?? 0), (_, idx) => (
                    <Page
                      key={`page_${idx + 1}`}
                      pageNumber={idx + 1}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={containerWidth}
                    />
                  ))}
                </Document>
              </div>

              {/* Card de Confirmação */}
              <div className="border-t bg-gray-50 p-4">
                <Card className="max-w-3xl mx-auto border-l-4 border-[#AF1B1B] shadow-sm">
                  <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {jaConfirmado ? "Documento já confirmado" : "Confirmar saída e registrar acesso"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {jaConfirmado
                          ? "Este documento já teve a leitura confirmada. Você pode apenas fechar."
                          : "Ao confirmar, seu acesso será registrado no monitoramento interno e o documento será fechado."}
                      </p>
                    </div>

                    <Button
                      onClick={handleConfirmAccess}
                      disabled={isConfirming}
                      className="bg-[#AF1B1B] hover:bg-[#8C1616] text-white px-6 py-2 rounded-md transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
                    >
                      {isConfirming ? "Processando..." : jaConfirmado ? "Fechar" : "Confirmar e sair"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}