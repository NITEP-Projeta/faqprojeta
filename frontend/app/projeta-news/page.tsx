"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FiFileText,
  FiTrendingUp,
  FiBriefcase,
  FiAlertCircle,
} from "react-icons/fi";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// 🔹 Lightbox e plugins
import Lightbox from "yet-another-react-lightbox";
import Captions from "yet-another-react-lightbox/plugins/captions";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";

// 🔹 Estilos necessários
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/captions.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// 🔹 Dados das edições (com imagens)
const projetaNewsData = [
  {
    title: "Boletim Semanal - 01",
    slug: "1 EDIÇÃO",
    icon: <FiFileText size={28} />,
  },
  {
    title: "Boletim Semanal - 02",
    slug: "2 EDIÇÃO",
    icon: <FiTrendingUp size={28} />,
  },
  {
    title: "Boletim Semanal - 03",
    slug: "3 EDIÇÃO",
    icon: <FiBriefcase size={28} />,
  },
  {
    title: "Boletim Semanal - 04",
    slug: "4 EDIÇÃO",
    icon: <FiFileText size={28} />,
  },
  {
    title: "Boletim Semanal - 05",
    slug: "5 EDIÇÃO",
    icon: <FiFileText size={28} />,
  },
  {
    title: "Boletim Semanal - 06",
    slug: "6 EDIÇÃO",
    icon: <FiTrendingUp size={28} />,
  },
  {
    title: "Boletim Semanal - 07",
    slug: "7 EDIÇÃO",
    icon: <FiBriefcase size={28} />,
  },
  {
    title: "Boletim Semanal - 08",
    slug: "8 EDIÇÃO",
    icon: <FiAlertCircle size={28} />,
  },
  {
    title: "Boletim Semanal - 09",
    slug: "9 EDIÇÃO",
    icon: <FiFileText size={28} />,
  },
  {
    title: "Boletim Semanal - 10",
    slug: "10 EDIÇÃO",
    icon: <FiTrendingUp size={28} />,
  },
  {
    title: "Boletim Semanal - 11",
    slug: "11 EDIÇÃO",
    icon: <FiFileText size={28} />,
  },
];

export default function ProjetaNewsPage() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  return (
    <ProtectedRoute>
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
              Projeta <span className="text-[#AF1B1B]">News</span>
            </h1>
            <div className="w-28 h-1 bg-[#AF1B1B] mx-auto rounded"></div>
            <p className="text-[#555] mt-3">
              Boletins internos semanais da Projeta — acompanhe atualizações,
              conquistas e comunicados corporativos.
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
            {projetaNewsData.map((item, i) => (
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
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center mt-2">
                  <Button
                    onClick={() => {
                      setIndex(i);
                      setOpen(true);
                    }}
                    className="px-5 py-2 bg-[#AF1B1B] text-white rounded-md transition-all duration-300 ease-in-out hover:bg-[#8C1616] hover:scale-105 hover:shadow-lg cursor-pointer"
                  >
                    Acessar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>

        {/* Rodapé */}
        <div className="w-full max-w-7xl">
          <p className="text-center text-sm text-[#7A7A7A] py-4">
            © {new Date().getFullYear()} Projeta • Sistema Interno Corporativo
          </p>
        </div>

        {/* Lightbox com legendas e miniaturas */}
        <Lightbox
          open={open}
          close={() => setOpen(false)}
          index={index}
          plugins={[Captions, Thumbnails]}
          slides={projetaNewsData.map((item) => ({
            src: `/images/news/${item.slug}.jpg`,
            title: item.title,
          }))}
          styles={{
            container: { backgroundColor: "rgba(0, 0, 0, 0.9)" },
            captionsTitle: { color: "#ffffff", fontSize: "1.2rem" },
            captionsDescription: { color: "#cccccc", fontSize: "0.9rem" },
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
