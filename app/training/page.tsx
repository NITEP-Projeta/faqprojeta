"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"

const manualData = [
  {
    title: "Código de Conduta",
    description: "Regras e valores que definem o comportamento profissional dentro da organização.",
    slug: "codigo-de-conduta",
  },
  {
    title: "Benefícios e Férias",
    description: "Tudo o que você precisa saber sobre benefícios, férias e licenças.",
    slug: "codigo-de-conduta",
  },
  {
    title: "Política de Home Office",
    description: "Diretrizes para trabalho remoto com segurança e produtividade.",
    slug: "codigo-de-conduta",
  },
  {
    title: "Segurança no Trabalho",
    description: "Normas e práticas para garantir um ambiente seguro para todos.",
    slug: "codigo-de-conduta",
  },
  {
    title: "Vestimenta Profissional",
    description: "Recomendações de vestimenta para cada tipo de ambiente e situação.",
    slug: "codigo-de-conduta",
  },
]

export default function ManualPage() {
  const [pdfSlug, setPdfSlug] = useState<string | null>(null);
  
  return (
  <div className="flex flex-col items-center justify-between min-h-screen bg-[#F5F5F5] gap-8 p-5">
      <div className="w-full max-w-7xl">

        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <Card className="shadow-md bg-white border border-[#ccc]">
            <CardHeader>
              <CardTitle className="text-3xl text-[#1A1A1A] font-bold text-center">
                Manual do <span className="text-[#D96C06]">Colaborador</span>
              </CardTitle>
              <CardDescription className="text-center text-[#4A4A4A]">
                Conheça as políticas, normas e diretrizes que regem nosso ambiente de trabalho.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>

      <div className="w-full max-w-7xl">
        {/* Grid de Cards de Conteúdo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {manualData.map((item) => (
            <Card
              key={item.slug}
              className="shadow-md bg-white border border-[#ccc] flex flex-col items-center justify-center text-center px-4 py-6"
            >
              <CardHeader className="flex flex-col items-center justify-center space-y-2 w-full">
                <CardTitle className="text-xl font-semibold text-[#1A1A1A]">{item.title}</CardTitle>
                <CardDescription className="text-sm text-[#555]">{item.description}</CardDescription>
              </CardHeader>

              <CardContent className="flex justify-center">
                  <Button onClick={() => setPdfSlug(item.slug)} className="rounded-full bg-[#D96C06] hover:bg-[#bf5f05] text-white">
                    Acessar
                  </Button>
              </CardContent>
            </Card>
          ))}
        </motion.div>
      </div>

      <div className="w-full max-w-7xl">
        {/* Footer Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2 }}
        >
          <Card className="shadow-sm bg-white border border-[#ccc]">
            <CardContent className="text-center text-sm text-[#7A7A7A] py-4">
              © {new Date().getFullYear()} Projeta • Sistema Interno Corporativo
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Modal PDF */}
      {pdfSlug && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-5xl h-[90vh] bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">

            {/* PDF Iframe responsivo */}
            <iframe
              src={`/pdfs/${pdfSlug}.pdf`}
              className="w-full h-full"
              title={`Manual - ${pdfSlug}`}
            />

            {/* Botão Fechar no canto inferior direito */}
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
  )
}
