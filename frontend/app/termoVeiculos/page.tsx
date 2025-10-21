"use client";

import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { FiTruck, FiFileText, FiX } from "react-icons/fi";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Importações do React-PDF
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// Configuração obrigatória do worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const termoVeiculosData = [
  {
    title: "Termo de Responsabilidade",
    description:
      "Documento de compromisso do colaborador ao utilizar veículos da empresa.",
    slug: "termo_de_responsabilidade",
    icon: <FiFileText size={28} />,
  },
  {
    title: "Guia de Uso e Cuidados com os Veículos",
    description:
      "Aprenda as boas práticas para dirigir, abastecer e conservar os veículos da empresa, garantindo segurança, economia e durabilidade.",
    slug: "MANUAL_DE_USO",
    icon: <FiTruck size={28} />,
  },
];

export default function TermoVeiculosPage() {
  const [pdfSlug, setPdfSlug] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // ✅ Recalcula automaticamente a largura do PDF quando o modal abre
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 32); // padding lateral
      }
    };

    window.addEventListener("resize", updateWidth);

    const observer = new MutationObserver(updateWidth);
    observer.observe(document.body, { childList: true, subtree: true });

    const timeout = setTimeout(updateWidth, 100); // garante cálculo pós-renderização

    return () => {
      window.removeEventListener("resize", updateWidth);
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [pdfSlug]);

  return (
    <ProtectedRoute>
      {/* Container principal */}
      <div className="flex flex-col items-center justify-between min-h-screen bg-[#F8F8F8] gap-8 p-6">
        {/* Cabeçalho */}
        <div className="w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">
              Termos de <span className="text-[#AF1B1B]">Veículos</span>
            </h1>
            <div className="w-28 h-1 bg-[#AF1B1B] mx-auto rounded"></div>
            <p className="text-[#555] mt-3">
              Documentos e formulários para controle e uso adequado dos veículos
              corporativos.
            </p>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {termoVeiculosData.map((item) => (
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
                    className="px-5 py-2 bg-[#AF1B1B] text-white rounded-md transition-all duration-300 ease-in-out hover:bg-[#8C1616] hover:scale-105 hover:shadow-lg"
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
              <div
                ref={containerRef}
                className="overflow-auto p-4 flex-1 bg-white"
              >
                <Document
                  file={`/pdfs/veiculo/${pdfSlug}.pdf`}
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

              {/* Botão Fechar */}
              <button
                onClick={() => setPdfSlug(null)}
                className="absolute top-8 right-2 bg-[#AF1B1B] hover:bg-[#8C1616] text-white p-2 rounded-full shadow-md transition-all duration-300 cursor-pointer"
                aria-label="Fechar"
              >
                <FiX size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}