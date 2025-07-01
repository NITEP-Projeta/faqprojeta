"use client"

import Link from "next/link"
import { trainingData } from "./data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function TrainingListPage() {
  return (
  <div className="flex items-start justify-center min-h-screen bg-[#EAEAEA]">
    <div className="container py-2">
      <div className="bg-[#EAEAEA] rounded-sm py-24 px-6 text-center">
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2.5 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-2xl sm:text-4xl md:text-4xl font-bold tracking-tight mb-4 text-[#1A1A1A]">
              Explore o Portal de <span className="text-primary">Treinamentos</span>
            </h1>
            <p className="text-1xl sm:text-4xl md:text-2xl text-muted-foreground mb-8 text-[#1A1A1A]">
            Aqui você encontra todos os cursos, materiais e conteúdos essenciais para o seu desenvolvimento. Aproveite para aprender, se atualizar e crescer com a gente.
            </p>
          </motion.div>
        </div>
        
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 pt-8 pb-8">
        {trainingData.map((item) => (
          <motion.div
          key={item.slug}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2.5}} // animação em cascata
          className="w-full"
          >
          <Card key={item.slug} className="flex justify-center text-center hover:shadow-md transition">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/training/${item.slug}`}>
                <Button className="bg-neutral-100 hover:bg-neutral-900 rounded-full" variant="outline">Acessar</Button>
              </Link>
            </CardContent>
          </Card>
          </motion.div>
        ))}
      </div>

      <div className="bg-[#EAEAEA] rounded-sm p-6">
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2.5 }}
            className="max-w-3xl mx-auto"
        >
        <footer className="text-sm text-center text-muted-foreground">
          © {new Date().getFullYear()} Projeta • Sistema Interno Corporativo
        </footer>
        </motion.div>
     </div>
    </div>
  </div>
  )
}
