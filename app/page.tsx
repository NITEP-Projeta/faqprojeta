"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, HelpCircle, ShieldCheck, Target, Eye, HeartHandshake } from "lucide-react"
import CursorBall from "@/components/CursorBall"

export default function HomePage() {
  return (
    <div className="relative">
      <CursorBall />

      {/* HERO */}
      <section className="bg-muted py-24 px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Bem-vindo ao Canal Interno da <span className="text-primary">Projeta</span>
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Acesse treinamentos, tire dúvidas e acompanhe comunicações institucionais.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/training">
              <Button size="lg">📚 Ver Treinamentos</Button>
            </Link>
            <Link href="/faq">
              <Button size="lg" variant="outline">❓ Tira-Dúvidas</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* MISSÃO, VISÃO, VALORES */}
      <section className="container py-16 grid md:grid-cols-3 gap-6 text-center">
        {[
          {
            title: "Missão",
            desc: "Oferecer soluções em engenharia com excelência técnica, inovação e compromisso com os resultados.",
            icon: <Target className="mx-auto text-primary w-8 h-8" />,
          },
          {
            title: "Visão",
            desc: "Ser referência nacional em engenharia consultiva, promovendo desenvolvimento sustentável.",
            icon: <Eye className="mx-auto text-primary w-8 h-8" />,
          },
          {
            title: "Valores",
            desc: "Ética, transparência, segurança, melhoria contínua e foco no cliente.",
            icon: <HeartHandshake className="mx-auto text-primary w-8 h-8" />,
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-background/80 backdrop-blur-sm border border-border rounded-xl shadow-md p-6"
          >
            {item.icon}
            <h2 className="text-xl font-semibold mt-3 mb-2">{item.title}</h2>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* FUNCIONALIDADES */}
      <section className="container pb-20 grid md:grid-cols-3 gap-8">
        {[
          {
            icon: <BookOpen className="text-red-700 w-7 h-7" />,
            title: "Treinamentos Internos",
            desc: "Conteúdos educativos, vídeos e orientações para todos os setores.",
            href: "/training"
          },
          {
            icon: <HelpCircle className="text-yellow-500 w-7 h-7" />,
            title: "Central de Dúvidas",
            desc: "FAQ e suporte para colaboradores com dúvidas sobre os sistemas.",
            href: "/faq"
          },
          {
            icon: <ShieldCheck className="text-green-600 w-7 h-7" />,
            title: "Área Administrativa",
            desc: "Acesso restrito para responsáveis por controle e conteúdo interno.",
            href: "/admin"
          }
        ].map((item, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.2, duration: 0.4 }}
            viewport={{ once: true }}
            className="bg-background/70 backdrop-blur-sm rounded-xl border border-border shadow-md hover:shadow-xl p-6 transition-all"
          >
            <div className="flex items-center gap-3 mb-4">
              {item.icon}
              <h2 className="text-lg font-semibold">{item.title}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
            <Link href={item.href}>
              <Button variant="link">Acessar</Button>
            </Link>
          </motion.div>
        ))}
      </section>

      {/* RODAPÉ */}
      <footer className="text-sm text-center text-muted-foreground py-6">
        © {new Date().getFullYear()} Projeta • Sistema Interno Corporativo
      </footer>
    </div>
  )
}
