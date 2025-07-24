'use client'

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HelpCircle, ShieldCheck, Target, Eye, HeartHandshake, Car, Book, List, Notebook, Contact } from "lucide-react"
import { MessageCircle } from "lucide-react";

import { Home, Info, FileText } from "lucide-react";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* HERO */}
      <section className="bg-muted py-24 px-6 text-center pt-40">
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
            <Link href="/faq">
              <Button size="lg" variant="outline">❓ Tira-Dúvidas</Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* MISSÃO, VISÃO, VALORES */}
      <section className="pt-10 pb-20 grid md:grid-cols-3 gap-10 w-full place-items-center bg-[#EAEAEA]">
        {[
          {
            title: 'Missão',
            desc: 'Oferecer soluções em engenharia com excelência técnica, inovação e compromisso com os resultados.',
            icon: <Target className="mx-auto text-primary w-8 h-8" />,
          },
          {
            title: 'Visão',
            desc: 'Ser referência nacional em engenharia consultiva, promovendo desenvolvimento sustentável.',
            icon: <Eye className="mx-auto text-primary w-8 h-8" />,
          },
          {
            title: 'Valores',
            desc: 'Ética, transparência, segurança, melhoria contínua e foco no cliente.',
            icon: <HeartHandshake className="mx-auto text-primary w-8 h-8" />,
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm rounded-xl border border-border shadow-md hover:shadow-xl p-6 transition-all w-[500]"
          >
            {item.icon}
            <h2 className="text-xl font-semibold mt-3 mb-2">{item.title}</h2>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* FUNCIONALIDADES */}
      <section className="pb-20 grid md:grid-cols-3 gap-10 w-full place-items-center bg-[#EAEAEA]">
        {[
          {
            icon: <Book className="text-red-600 w-7 h-7" />,
            title: "Manual do Colaborador",
            desc: "Conteúdos educativos, vídeos e orientações para todos os setores.",
            href: "/training"
          },
          {
            icon: <List className="text-amber-500 w-7 h-7" />,
            title: "Manual Interno",
            desc: "FAQ e suporte para colaboradores com dúvidas sobre os sistemas.",
            href: "/faq"
          },
          {
            icon: <ShieldCheck className="text-green-600 w-7 h-7" />,
            title: "Diretrizes Internas",
            desc: "Acesso restrito para responsáveis por controle e conteúdo interno.",
            href: "/admin"
          },
          {
            icon: <Notebook className="text-green-500 w-7 h-7" />,
            title: "SIPOC",
            desc: "Acesso restrito para responsáveis por controle e conteúdo interno.",
            href: "/admin"
          },
          {
            icon: <Car className="text-teal-600 w-7 h-7" />,
            title: "Termo Veículos",
            desc: "Acesso restrito para responsáveis por controle e conteúdo interno.",
            href: "/admin"
          },
          {
            icon: <Contact className="text-lime-600 w-7 h-7" />,
            title: "Caderno De Cargos",
            desc: "Acesso restrito para responsáveis por controle e conteúdo interno.",
            href: "/admin"
          },
          {
            icon: <HelpCircle className="text-yellow-500 w-7 h-7" />,
            title: "Tira Duvidas",
            desc: "Acesso restrito para responsáveis por controle e conteúdo interno.",
            href: "/admin"
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
              className="flex flex-col items-center justify-center bg-background/70 backdrop-blur-sm rounded-xl border border-border shadow-md hover:shadow-xl p-6 transition-all w-[500]"
            >
              <div className="flex items-center gap-3 mb-4">
                {item.icon}
                <h2 className="text-lg font-semibold">{item.title}</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
              <Link href={item.href}>
                <Button variant="link" className="mt-4 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-300 rounded-md font-medium hover:bg-blue-100 transition-colors duration-200">Acessar</Button>
              </Link>
            </motion.div>
          ))}
        </section>

      <section>
        <div className="fixed bottom-6 right-6 z-50">
          <button className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition">
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="text-sm text-center text-muted-foreground py-6 bg-[#EAEAEA]">
        © {new Date().getFullYear()} Projeta • Sistema Interno Corporativo
      </footer>
    </div>
  )
}
