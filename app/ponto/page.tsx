"use client"

import { useState } from "react";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { FiCalendar, FiClock, FiEdit, FiAlertCircle, FiBookOpen } from "react-icons/fi";

import { ProtectedRoute } from "@/components/ProtectedRoute";

const manualPontoData = [
  {
    title: "Registro de Ponto",
    description: "Formulário ou link para registro de entrada e saída dos colaboradores.",
    slug: "registro-ponto",
    icon: <FiClock size={28}/>,
  },
  {
    title: "Atrasos e Justificativas",
    description: "Modelo para justificativa de atrasos e ausências.",
    slug: "atrasos-e-justificativas",
    icon: <FiEdit size={28}/>,
  },
  {
    title: "Banco de Horas",
    description: "Regras e acompanhamento do banco de horas dos colaboradores.",
    slug: "banco-de-horas",
    icon: <FiBookOpen size={28}/>,
  },
  {
    title: "Política de Pontualidade",
    description: "Diretrizes da empresa quanto à pontualidade e assiduidade.",
    slug: "politica-pontualidade",
    icon: <FiCalendar size={28}/>,
  },
  {
    title: "Ocorrências de Ponto",
    description: "Registro de incidentes relacionados ao controle de ponto.",
    slug: "ocorrencias-ponto",
    icon: <FiAlertCircle size={28}/>,
  },
]

export default function ManualPontoPage() {
  const [pdfSlug, setPdfSlug] = useState<string | null>(null);

  return (
    // Proteção de rota para garantir que apenas usuários autenticados acessem esta página
    <ProtectedRoute>
    {/* Header */}
    <div className="flex flex-col items-center justify-between min-h-screen bg-[#F8F8F8] gap-8 p-6">
      <div className="w-full max-w-7xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} className="text-center">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">Manual de <span className="text-[#AF1B1B]">Ponto</span></h1>
          <div className="w-28 h-1 bg-[#AF1B1B] mx-auto rounded"></div>
          <p className="text-[#555] mt-3">Documentos e orientações relacionados ao controle de ponto dos colaboradores.</p>
        </motion.div>
      </div>
      <div className="w-full max-w-7xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {manualPontoData.map((item) => (
            <Card key={item.slug} className="relative bg-white border-l-4 shadow-sm hover:shadow-xl transition-transform transform hover:-translate-y-1 rounded-md p-4 flex flex-col items-center text-center">
              <div className="mb-3 text-[#AF1B1B]">{item.icon}</div>
              <CardHeader className="flex flex-col items-center justify-center space-y-2 w-full">
                <CardTitle className="text-lg font-semibold text-[#1A1A1A]">{item.title}</CardTitle>
                <CardDescription className="text-sm text-[#555]">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center mt-2">
                <Button onClick={() => setPdfSlug(item.slug)} className="px-5 py-2 bg-[#AF1B1B] text-white rounded-md transition-all cursor-pointer hover:bg-[#8C1616] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                  Acessar
                </Button>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
      <div className="w-full max-w-7xl">
        <p className="text-center text-sm text-[#7A7A7A] py-4">© {new Date().getFullYear()} Projeta • Sistema Interno Corporativo</p>
      </div>
      {pdfSlug && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-5xl h-[90vh] bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
            <iframe src={`/pdfs/${pdfSlug}.pdf`} className="w-full h-full" title={`Manual Ponto - ${pdfSlug}`}/>
            <button onClick={() => setPdfSlug(null)} className="absolute bottom-3 right-3 bg-[#D96C06] hover:bg-[#bf5f05] text-white px-4 py-2 rounded-full text-sm sm:text-base">
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
}