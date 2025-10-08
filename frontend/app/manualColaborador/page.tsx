"use client"

import { useState } from "react";

import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

import { FiUsers, FiBriefcase, FiHome, FiShield, FiCheckSquare, FiCreditCard } from "react-icons/fi";

import Image from "next/image";

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

import { ProtectedRoute } from "@/components/ProtectedRoute";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";

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
  const [selectedContent, setSelectedContent] = useState<string | null>(null);

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
              <Button
                onClick={() => {
                  if (item.slug === "beneficios-e-ferias") {
                    setSelectedContent("beneficios");
                  } else {
                    setPdfSlug(item.slug);
                  }
                }}
                className="px-5 py-2 bg-[#D96C06] text-white rounded-md transition-all cursor-pointer px-5 py-2 bg-[#AF1B1B] text-white rounded-md cursor-pointer hover:bg-[#8C1616] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
              >
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
      {selectedContent === "beneficios" && (
        <div className="fixed inset-0 z-50 bg-black/10 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-3xl h-[90vh] bg-white shadow-lg rounded-lg overflow-y-auto p-8 text-left">

            <h2 className="text-3xl font-bold mb-6 text-black">Benefícios</h2>

            <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="flash">
              
              {/* Flash Benefícios */}
              <AccordionItem value="flash">
                <AccordionTrigger className="text-base font-semibold text-[#AF1B1B] cursor-pointer">
                  Alimentação
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                  <p className="text-base leading-relaxed text-[#333] text-justify">
                    A <span className="font-bold">Projeta</span> oferece aos colaboradores o benefício de Cesta Básica, disponibilizado por meio da <span className="font-bold">Plataforma Flash Benefícios</span>, garantindo praticidade, transparência e autonomia na gestão dos créditos.
                    As cestas são entregues na 2ª quarta-feira de cada mês, conforme calendário interno, assegurando regularidade e atendimento a todos os colaboradores elegíveis.
                    O programa tem como objetivo valorizar o bem-estar dos colaboradores, simplificar a administração dos benefícios e fortalecer o vínculo entre empresa e equipe por meio de uma solução moderna e digital.
                  </p>
                  <Image src="/images/beneficios/flash1.png" alt="Parceiros Flash" width={500} height={250} className="rounded-md shadow mx-auto" />

                  <Swiper modules={[Autoplay]} spaceBetween={20} slidesPerView={3} loop={true} autoplay={{ delay: 20,   disableOnInteraction: false, pauseOnMouseEnter: false  }} speed={1000}>
                    <SwiperSlide><Image src="/images/beneficios/mcdonalds.png" alt="Parceiro Flash 1" width={40} height={120} className="rounded-md shadow mx-auto" /></SwiperSlide>
                    <SwiperSlide><Image src="/images/beneficios/localiza.png" alt="Parceiro Flash 2" width={40} height={120} className="rounded-md shadow mx-auto" /></SwiperSlide>
                    <SwiperSlide><Image src="/images/beneficios/outback.png" alt="Parceiro Flash 3" width={40} height={120} className="rounded-md shadow mx-auto" /></SwiperSlide>
                  </Swiper>
                </AccordionContent>
              </AccordionItem>

              {/* Vale Transporte */}
              <AccordionItem value="vale-transporte">
                <AccordionTrigger className="text-base font-semibold text-[#AF1B1B] cursor-pointer">
                  Vale Transporte
                </AccordionTrigger>
                <AccordionContent className="flex flex-col gap-4 text-balance">
                  <p className="text-base leading-relaxed text-[#333] text-justify">
                    Benefício concedido aos colaboradores para custeio do deslocamento residência–trabalho e trabalho–residência, em conformidade com a legislação vigente (Lei nº 7.418/1985).
                    O desconto aplicado é de 6% sobre o salário base ou conforme disposto na Convenção Coletiva de Trabalho aplicável à categoria.
                    A concessão do vale-transporte visa garantir o acesso regular e seguro ao local de trabalho, promovendo pontualidade e assiduidade dos colaboradores.
                  </p>
                  <Image src="/images/beneficios/vale_transporte.png" alt="Parceiros Flash" width={500} height={250} className="rounded-md shadow mx-auto" />                  
                </AccordionContent>
              </AccordionItem>

              {/* Hapvida */}
              <AccordionItem value="hapvida">
                <AccordionTrigger className="text-base font-semibold text-[#AF1B1B] cursor-pointer">
                  Plano de Saúde
                </AccordionTrigger>
                <AccordionContent className="pt-3 space-y-3">
                  <p className="text-base leading-relaxed text-[#333] text-justify">
                    A Projeta oferece o Plano de Saúde Hapvida, com custo compartilhado entre empresa (50%) e colaborador (50%), garantindo acesso a uma ampla rede credenciada de clínicas, hospitais e laboratórios.
                    O benefício visa promover o bem-estar e a segurança dos colaboradores, proporcionando atendimento médico de qualidade e incentivando o cuidado preventivo com a saúde.
                  </p>
                  <Image src="/images/beneficios/hapvida_plano.png" alt="Parceiros Flash" width={500} height={250} className="rounded-md shadow mx-auto" />                  
                </AccordionContent>
              </AccordionItem>

              {/* Icatu */}
              <AccordionItem value="icatu">
                <AccordionTrigger className="text-base font-semibold text-[#AF1B1B] cursor-pointer">
                  Seguro de Vida
                </AccordionTrigger>
                <AccordionContent className="pt-3 space-y-3">
                  <p className="text-base leading-relaxed text-[#333] text-justify">
                    A Projeta disponibiliza o Seguro de Vida Icatu Seguros a todos os colaboradores, sem desconto em folha, garantindo proteção financeira em casos de falecimento, invalidez ou outros eventos cobertos pela apólice.
                    O benefício reforça o compromisso da empresa com a segurança e o amparo às famílias dos colaboradores, assegurando tranquilidade e suporte em situações imprevistas.
                  </p>
                  <Image src="/images/beneficios/icatu_seguros_banner.jpg" alt="Parceiros Flash" width={800} height={250} className="rounded-md shadow mx-auto" />                  
                </AccordionContent>
              </AccordionItem>

            {/* Seção de Férias */}
            <AccordionItem value="ferias">
              <AccordionTrigger className="text-base font-semibold text-[#AF1B1B] cursor-pointer">
                Férias
              </AccordionTrigger>
              <AccordionContent className="pt-3">
                <div className="space-y-8 text-base leading-relaxed text-[#333]">
                  <p className="text-base leading-relaxed text-[#333] text-justify">
                    As férias constituem um direito trabalhista garantido pela Consolidação das Leis do Trabalho (CLT), destinado ao descanso e à recuperação física e mental do colaborador após o período de 12 meses de serviço.
                    A política da Projeta segue integralmente a legislação vigente, assegurando transparência, planejamento e conformidade em todo o processo de concessão, programação e pagamento das férias.
                  </p>

                  <ul className="list-disc pl-6 space-y-3 text-base leading-relaxed text-[#333]">
                  <li>30 dias após 12 meses de trabalho (período aquisitivo)</li>
                  <li>Concessão até 12 meses após período aquisitivo</li>
                  <li>Possibilidade de férias coletivas (com acordo e ciência do sindicato)</li>
                  <li>Notificação via app do ponto, assinada pelo empregado</li>
                  <li>Proibido início de férias em 2 dias antes de feriado ou descanso semanal</li>
                  <li>Abono pecuniário: venda de até 1/3 das férias</li>
                  <li>Fracionamento em até 3 períodos (mínimo 14 dias + 5 + 5)</li>
                  <li>Pagamento até 2 dias antes do início do período</li>
                  </ul>

                  <Image src="/images/beneficios/ferias.jpg" alt="Parceiros Flash" width={500} height={250} className="rounded-md shadow mx-auto" />                  
                </div>
              </AccordionContent>
            </AccordionItem>
            </Accordion>
            <button
              onClick={() => setSelectedContent(null)}
              className="absolute top-4 right-4 text-[#AF1B1B] hover:text-[#8C1616] text-2xl font-bold transition cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
}
