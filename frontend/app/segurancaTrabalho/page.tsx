"use client";

import { useRef, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { ShieldAlert, TriangleAlert, FileCheck2, Presentation, X } from "lucide-react";

// Configuração obrigatória do worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

type DocumentoSeguranca = {
  title: string;
  description: string;
  slug: string;
  path: string;
  icon: React.ReactNode;
};

const segurancaTrabalhoData: DocumentoSeguranca[] = [
  {
    title: "Direito de Recusa",
    description:
      "Formulário para registro formal de recusa em situações com condição de risco ou insegurança.",
    slug: "direito-de-recusa-formulario",
    path: "/pdfs/seguranca-trabalho/direito_de_recusa.pdf",
    icon: <FileCheck2 className="w-8 h-8" />,
  }
];

export default function SegurancaTrabalhoPage() {
  const [pdfSlug, setPdfSlug] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const selectedDocument = useMemo(() => {
    return segurancaTrabalhoData.find((item) => item.slug === pdfSlug) ?? null;
  }, [pdfSlug]);

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

  const handleCloseModal = () => {
    setPdfSlug(null);
    setNumPages(null);
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
            <div className="flex items-center justify-center gap-3 mb-2">
              <TriangleAlert className="w-9 h-9 text-[#AF1B1B]" />
              <h1 className="text-4xl font-bold text-[#1A1A1A]">
                Segurança do <span className="text-[#AF1B1B]">Trabalho</span>
              </h1>
            </div>

            <div className="w-28 h-1 bg-[#AF1B1B] mx-auto rounded"></div>

            <p className="text-[#555] mt-3 max-w-3xl mx-auto">
              Consulte documentos e materiais de orientação relacionados à
              prevenção de riscos, boas práticas de segurança e direito de
              recusa em situações de perigo.
            </p>
          </motion.div>
        </div>

        {/* Grid de Cards */}
        <div className="w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {segurancaTrabalhoData.map((item) => (
              <Card
                key={item.slug}
                className="relative bg-white border-l-4 shadow-sm hover:shadow-xl transition-transform transform hover:-translate-y-1 rounded-md p-4 flex flex-col items-center text-center"
              >
                <div className="mb-3 text-[#AF1B1B]">{item.icon}</div>

                <CardHeader className="flex flex-col items-center justify-center space-y-2 w-full">
                  <CardTitle className="text-lg font-semibold text-[#1A1A1A]">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-[#555]">
                    {item.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex justify-center mt-2">
                  <Button
                    onClick={() => setPdfSlug(item.slug)}
                    className="px-5 py-2 bg-[#AF1B1B] text-white rounded-md transition-all duration-300 ease-in-out hover:bg-[#8C1616] hover:scale-105 hover:shadow-lg cursor-pointer"
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
        {selectedDocument && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4">
            <div className="relative w-full max-w-7xl h-[95vh] bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
              <div className="border-b px-5 py-4 bg-white">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  {selectedDocument.title}
                </h2>
                <p className="text-sm text-[#666] mt-1">
                  {selectedDocument.description}
                </p>
              </div>

              <div
                ref={containerRef}
                className="overflow-auto p-4 flex-1 bg-white"
              >
                <Document
                  file={selectedDocument.path}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={
                    <p className="text-center text-gray-500 mt-10">
                      Carregando documento...
                    </p>
                  }
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

              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 bg-[#AF1B1B] hover:bg-[#8C1616] text-white p-2 rounded-full shadow-md transition-all duration-300 cursor-pointer"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}