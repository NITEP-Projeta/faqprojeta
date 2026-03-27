"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { YouTubeEmbed } from "@next/third-parties/google";
import { PlayCircle, FileText, Clock, ClipboardList, X } from "lucide-react";

type VideoItem = {
  title: string;
  description: string;
  videoId: string;
  category: string;
  icon: React.ReactNode;
};

const videosData: VideoItem[] = [
  {
    title: "Atestado Médico",
    description:
      "Orientações sobre o envio e registro de atestados médicos, incluindo prazos e procedimentos internos.",
    videoId: "hSN4PtOcEE4",
    category: "Recursos Humanos",
    icon: <FileText className="w-8 h-8" />,
  },
  {
    title: "Inclusão de Saldo no Banco de Horas",
    description:
      "Passo a passo para lançamento e acompanhamento de saldo no banco de horas dentro do sistema.",
    videoId: "mqzn2g4_RJk",
    category: "Recursos Humanos",
    icon: <Clock className="w-8 h-8" />,
  },
  {
    title: "Inserção de Evento à Disposição",
    description:
      "Procedimento para registro de eventos à disposição, com orientações sobre preenchimento correto no sistema.",
    videoId: "6W9yZ60L2kY",
    category: "Operacional",
    icon: <ClipboardList className="w-8 h-8" />,
  },
];

export default function VideosTreinamentoPage() {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const selectedVideo = useMemo(() => {
    return videosData.find((item) => item.videoId === selectedVideoId) ?? null;
  }, [selectedVideoId]);

  const handleCloseModal = () => {
    setSelectedVideoId(null);
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
              <PlayCircle className="w-9 h-9 text-[#AF1B1B]" />
              <h1 className="text-4xl font-bold text-[#1A1A1A]">
                Vídeos de <span className="text-[#AF1B1B]">Treinamento</span>
              </h1>
            </div>

            <div className="w-28 h-1 bg-[#AF1B1B] mx-auto rounded"></div>

            <p className="text-[#555] mt-3 max-w-3xl mx-auto">
              Acesse conteúdos em vídeo para orientação, capacitação e apoio às
              diretrizes internas da organização.
            </p>
          </motion.div>
        </div>

        {/* Grid de cards */}
        <div className="w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {videosData.map((item) => (
              <Card
                key={item.videoId}
                className="relative bg-white border-l-4 shadow-sm hover:shadow-xl transition-transform transform hover:-translate-y-1 rounded-md p-4 flex flex-col items-center text-center"
              >
                <div className="mb-3 text-[#AF1B1B]">{item.icon}</div>

                <CardHeader className="flex flex-col items-center justify-center space-y-2 w-full">
                  <div className="text-xs font-medium uppercase tracking-wide text-[#AF1B1B]">
                    {item.category}
                  </div>

                  <CardTitle className="text-lg font-semibold text-[#1A1A1A]">
                    {item.title}
                  </CardTitle>

                  <CardDescription className="text-sm text-[#555]">
                    {item.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex justify-center mt-2">
                  <Button
                    onClick={() => setSelectedVideoId(item.videoId)}
                    className="px-5 py-2 bg-[#AF1B1B] text-white rounded-md transition-all duration-300 ease-in-out hover:bg-[#8C1616] hover:scale-105 hover:shadow-lg cursor-pointer"
                  >
                    Assistir
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

        {/* Modal do vídeo */}
        {selectedVideo && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4">
            <div className="relative w-full max-w-5xl bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
              <div className="border-b px-5 py-4 bg-white">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  {selectedVideo.title}
                </h2>
                <p className="text-sm text-[#666] mt-1">
                  {selectedVideo.description}
                </p>
              </div>

              <div className="p-4 bg-white">
                <div className="w-full overflow-hidden rounded-lg">
                  <YouTubeEmbed
                    videoid={selectedVideo.videoId}
                    params="rel=0"
                    style="max-width: 100%; width: 100%;"
                  />
                </div>
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