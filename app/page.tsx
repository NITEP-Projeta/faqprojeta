"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, HelpCircle, ShieldCheck } from "lucide-react"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
      }}
      className="flex flex-col min-h-screen"
    >
      {/* HERO */}
      <motion.section
        variants={{ hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-background py-20 text-center"
      >
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold tracking-tight lg:text-5xl mb-4">
            Bem-vindo ao Canal Interno da Projeta
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg mb-8">
            Sua central de treinamentos, dúvidas frequentes e acesso administrativo.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/training">
              <Button size="lg">📚 Ver Treinamentos</Button>
            </Link>
            <Link href="/faq">
              <Button size="lg" variant="outline">❓ Tirar Dúvidas</Button>
            </Link>
          </div>
        </div>
      </motion.section>

      {/* FUNCIONALIDADES */}
      <section className="py-16 bg-muted">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
          {[{
            title: "Treinamentos",
            desc: "Acesse os principais conteúdos da empresa de forma prática.",
            icon: <BookOpen className="w-8 h-8 text-red-800" />,
            href: "/training"
          }, {
            title: "Tira-Dúvidas",
            desc: "Veja perguntas frequentes e respostas da equipe de suporte.",
            icon: <HelpCircle className="w-8 h-8 text-yellow-500" />,
            href: "/faq"
          }, {
            title: "Área Administrativa",
            desc: "Acesso restrito à gestão e configurações do sistema interno.",
            icon: <ShieldCheck className="w-8 h-8 text-green-600" />,
            href: "/admin"
          }].map((item, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                visible: { opacity: 1, scale: 1 },
              }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              <Card className="hover:shadow-xl transition">
                <CardHeader className="flex flex-col items-start gap-2">
                  {item.icon}
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.desc}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={item.href}>
                    <Button variant="link">Acessar</Button>
                  </Link>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <motion.footer
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="text-sm text-center text-muted-foreground py-6"
      >
        © {new Date().getFullYear()} Projeta. Todos os direitos reservados.
      </motion.footer>
    </motion.div>
  )
}
