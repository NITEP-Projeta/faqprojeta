"use client"

import { useState } from "react";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { FiUsers, FiBriefcase, FiHome, FiShield, FiCheckSquare, FiCreditCard } from "react-icons/fi";

import { ProtectedRoute } from "@/components/ProtectedRoute";

const manualData = [
  {
    title: "Código de Conduta",
    description: "Regras e valores que definem o comportamento profissional dentro da organização.",
    slug: "codigo-de-conduta",
    icon: <FiUsers size={28}/>,
  },
  {
    title: "Benefícios e Férias",
    description: "Tudo o que você precisa saber sobre benefícios, férias e licenças.",
    slug: "beneficios-e-ferias",
    icon: <FiBriefcase size={28}/>,
  },
  {
    title: "Política de Home Office",
    description: "Diretrizes para trabalho remoto com segurança e produtividade.",
    slug: "politica-home-office",
    icon: <FiHome size={28}/>,
  },
  {
    title: "Segurança no Trabalho",
    description: "Normas e práticas para garantir um ambiente seguro para todos.",
    slug: "seguranca-no-trabalho",
    icon: <FiShield size={28}/>,
  },
  {
    title: "Vestimenta Profissional",
    description: "Recomendações de vestimenta para cada tipo de ambiente e situação.",
    slug: "vestimenta-profissional",
    icon: <FiCheckSquare size={28}/>,
  },
  {
    title: "Política de Reembolso",
    description: "Orientações sobre como solicitar reembolsos de despesas corporativas.",
    slug: "politica-de-reembolso",
    icon: <FiCreditCard size={28} />,
  }
]

export default function ManualPage() {
  const [pdfSlug, setPdfSlug] = useState<string | null>(null);
  
  return (
    // Proteção de rota para garantir que apenas usuários autenticados acessem a página
    <ProtectedRoute>
    <div className="flex flex-col items-center justify-between min-h-screen bg-[#F8F8F8] gap-8 p-6">
      {/* Header */}
      <div className="w-full max-w-7xl">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2 }} className="text-center">
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">Manual do <span className="text-[#AF1B1B]">Colaborador</span></h1>
          <div className="w-24 h-1 bg-[#AF1B1B] mx-auto rounded"></div>
          <p className="text-[#555] mt-3">Conheça as políticas, normas e diretrizes que regem nosso ambiente de trabalho.</p>
        </motion.div>
      </div>
      {/* Cards */}
      <div className="w-full max-w-7xl">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5 }} className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {manualData.map((item) => (
            <Card key={item.slug} className="relative bg-white border-l-4 shadow-sm hover:shadow-xl transition-transform transform hover:-translate-y-1 rounded-md p-4 flex flex-col items-center text-center">
              <div className="mb-3 text-[#AF1B1B]">{item.icon}</div>
              <CardHeader className="flex flex-col items-center justify-center space-y-2 w-full">
                <CardTitle className="text-lg font-semibold text-[#1A1A1A]">{item.title}</CardTitle>
                <CardDescription className="text-sm text-[#555]">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center mt-2">
                <Button onClick={() => setPdfSlug(item.slug)} className="px-5 py-2 bg-[#D96C06] text-white rounded-md transition-all cursor-pointer px-5 py-2 bg-[#AF1B1B] text-white rounded-md cursor-pointer hover:bg-[#8C1616] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg">
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
            <iframe src={`/pdfs/${pdfSlug}.pdf`} className="w-full h-full" title={`Manual - ${pdfSlug}`}/>
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
