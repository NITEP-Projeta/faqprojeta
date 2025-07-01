"use client"

import Link from "next/link"
import { trainingData } from "./data"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function TrainingListPage() {
  return (
  <div className="flex items-start justify-center min-h-screen">
    <div className="container py-2">
      <div className="bg-muted py-24 px-6 text-center">
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 2.5 }}
            className="max-w-3xl mx-auto"
          >
            <h1 className="text-2xl sm:text-4xl md:text-4xl font-bold tracking-tight mb-4">
              Explore o Portal de <span className="text-primary">Treinamentos</span>
            </h1>
            <p className="text-1xl sm:text-4xl md:text-2xl text-muted-foreground mb-8">
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
                <Button variant="outline">Acessar</Button>
              </Link>
            </CardContent>
          </Card>
          </motion.div>
        ))}
      </div>

      <div className="bg-muted p-6">
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
