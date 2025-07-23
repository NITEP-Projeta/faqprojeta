"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const manualData = [
  {
    title: "Código de Conduta",
    description: "Regras e valores que definem o comportamento profissional dentro da organização.",
    slug: "codigo-de-conduta",
  },
  {
    title: "Benefícios e Férias",
    description: "Tudo o que você precisa saber sobre benefícios, férias e licenças.",
    slug: "beneficios-e-ferias",
  },
  {
    title: "Política de Home Office",
    description: "Diretrizes para trabalho remoto com segurança e produtividade.",
    slug: "politica-home-office",
  },
  {
    title: "Segurança no Trabalho",
    description: "Normas e práticas para garantir um ambiente seguro para todos.",
    slug: "seguranca-no-trabalho",
  },
  {
    title: "Vestimenta Profissional",
    description: "Recomendações de vestimenta para cada tipo de ambiente e situação.",
    slug: "vestimenta-profissional",
  },
]

export default function ManualPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5F5F5] px-4 py-10">
      <div className="w-full max-w-7xl grid gap-8">

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

        {/* Grid de Cards de Conteúdo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {manualData.map((item) => (
            <Card key={item.slug} className="shadow-md bg-white border border-[#ccc] flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#1A1A1A]">{item.title}</CardTitle>
                <CardDescription className="text-sm text-[#555]">{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Link href={`/manual/${item.slug}`}>
                  <Button className="rounded-full bg-[#D96C06] hover:bg-[#bf5f05] text-white">
                    Acessar
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </motion.div>

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
    </div>
  )
}
