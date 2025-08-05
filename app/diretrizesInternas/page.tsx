"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { FiBookOpen, FiUsers, FiShield, FiFileText, FiCheckCircle } from "react-icons/fi"
import { ProtectedRoute } from "@/components/ProtectedRoute"

const diretrizesData = [
  {
    title: "Ética Profissional",
    description: "Princípios éticos que norteiam nossas atividades e relações internas e externas.",
    slug: "etica-profissional",
    icon: <FiBookOpen size={28}/>,
  },
  {
    title: "Conduta Organizacional",
    description: "Normas de comportamento e relacionamento entre colaboradores e setores.",
    slug: "conduta-organizacional",
    icon: <FiUsers size={28}/>,
  },
  {
    title: "Segurança da Informação",
    description: "Diretrizes para proteção de dados internos, confidencialidade e boas práticas digitais.",
    slug: "seguranca-da-informacao",
    icon: <FiShield size={28}/>,
  },
  {
    title: "Gestão de Políticas Internas",
    description: "Documentos oficiais e padrões que regem procedimentos internos.",
    slug: "gestao-politicas-internas",
    icon: <FiFileText size={28}/>,
  },
  {
    title: "Conformidade e Auditorias",
    description: "Regras para garantir conformidade com normas internas e externas, incluindo auditorias periódicas.",
    slug: "conformidade-auditorias",
    icon: <FiCheckCircle size={28}/>,
  },
]

export default function DiretrizesInternasPage() {
  const [pdfSlug, setPdfSlug] = useState<string | null>(null);
  
  return (
    <ProtectedRoute>
    <div className="flex flex-col items-center justify-between min-h-screen bg-[#F8F8F8] gap-8 p-6">
      <div className="w-full max-w-7xl">

        {/* Header com barra decorativa */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
          className="text-center"
        >
          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">Diretrizes <span className="text-[#AF1B1B]">Internas</span></h1>
          <div className="w-28 h-1 bg-[#AF1B1B] mx-auto rounded"></div>
          <p className="text-[#555] mt-3">
            Consulte as diretrizes corporativas para garantir alinhamento, ética e segurança em nossas operações.
          </p>
        </motion.div>
      </div>

      <div className="w-full max-w-7xl">
        {/* Grid de Cards */}
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
                  className="px-5 py-2 bg-[#D96C06] text-white rounded-md transition-all cursor-pointer px-5 py-2 bg-[#AF1B1B] text-white rounded-md transition-all cursor-pointer hover:bg-[#8C1616] transition-all duration-300 ease-in-out 
hover:scale-105 hover:shadow-lg"
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>

      <div className="w-full max-w-7xl">
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <p className="text-center text-sm text-[#7A7A7A] py-4">
            © {new Date().getFullYear()} Projeta • Sistema Interno Corporativo
          </p>
        </motion.div>
      </div>

      {/* Modal PDF */}
      {pdfSlug && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-5xl h-[90vh] bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">

            {/* PDF Iframe */}
            <iframe
              src={`/pdfs/${pdfSlug}.pdf`}
              className="w-full h-full"
              title={`Diretrizes Internas - ${pdfSlug}`}
            />

            {/* Botão Fechar */}
            <button
              onClick={() => setPdfSlug(null)}
              className="absolute bottom-3 right-3 bg-[#D96C06] hover:bg-[#bf5f05] text-white px-4 py-2 rounded-full text-sm sm:text-base"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
}
