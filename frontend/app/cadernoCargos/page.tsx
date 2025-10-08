"use client"

import { useState } from "react";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { FiMap , FiFileText, FiAward, FiList, FiBriefcase, FiX } from "react-icons/fi";

import { ProtectedRoute } from "@/components/ProtectedRoute";

const cadernoCargosData = [
  {
    title: "Mapa de Cargos e Responsabilidades",
    description: "Apresenta as funções, responsabilidades e níveis hierárquicos da organização, garantindo clareza na definição de papéis.",
    slug: "mapa_cargos_responsabilidades",
    icon: <FiMap  size={28}/>,
  },
  /*{
    title: "Descrição de Funções",
    description: "Documento com as atividades, responsabilidades e requisitos de cada função.",
    slug: "descricao-de-funcoes",
    icon: <FiFileText size={28}/>,
  },
  {
    title: "Plano de Carreira",
    description: "Guia para evolução de cargos e crescimento profissional na organização.",
    slug: "plano-de-carreira",
    icon: <FiAward size={28}/>,
  },
  {
    title: "Tabela Salarial",
    description: "Informações sobre faixas salariais correspondentes a cada cargo.",
    slug: "tabela-salarial",
    icon: <FiList size={28}/>,
  },
  {
    title: "Competências por Cargo",
    description: "Habilidades e conhecimentos necessários para cada posição.",
    slug: "competencias-por-cargo",
    icon: <FiBriefcase size={28}/>,
  },*/
]

export default function CadernoCargosPage() {
  const [pdfSlug, setPdfSlug] = useState<string | null>(null);
  
  return (
    // Proteção de rota para garantir que apenas usuários autenticados acessem a página
    <ProtectedRoute>
    <div className="flex flex-col items-center justify-between min-h-screen bg-[#F8F8F8] gap-8 p-6">
      {/* Header */}
      <div className="w-full max-w-7xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} className="text-center">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">Caderno de <span className="text-[#AF1B1B]">Cargos</span></h1>
          <div className="w-28 h-1 bg-[#AF1B1B] mx-auto rounded"></div>
          <p className="text-[#555] mt-3">Documentos com informações sobre cargos, funções, competências e planos de carreira.</p>
        </motion.div>
      </div>
      {/* Grid */}
      <div className="w-full max-w-7xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cadernoCargosData.map((item) => (
            <Card key={item.slug} className="relative bg-white border-l-4 shadow-sm hover:shadow-xl transition-transform transform hover:-translate-y-1 rounded-md p-4 flex flex-col items-center text-center">
              <div className="mb-3 text-[#AF1B1B]">{item.icon}</div>
              <CardHeader className="flex flex-col items-center justify-center space-y-2 w-full">
                <CardTitle className="text-lg font-semibold text-[#1A1A1A]">{item.title}</CardTitle>
                <CardDescription className="text-sm text-[#555]">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center mt-2">
                <Button onClick={() => setPdfSlug(item.slug)} className="px-5 py-2 bg-[#D96C06] text-white rounded-md transition-all cursor-pointer px-5 py-2 bg-[#AF1B1B] text-white rounded-md transition-all cursor-pointer hover:bg-[#8C1616] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
                  Acessar
                </Button>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>
      {/* Footer */}
      <div className="w-full max-w-7xl">
        <p className="text-center text-sm text-[#7A7A7A] py-4">© {new Date().getFullYear()} Projeta • Sistema Interno Corporativo</p>
      </div>
      {/* Modal PDF */}
      {pdfSlug && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-5xl h-[90vh] bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
            <iframe src={`/pdfs/cargos/${pdfSlug}.pdf`} className="w-full h-full"title={`Caderno de Cargos - ${pdfSlug}`}/>
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
  )
}
