"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FiBriefcase, FiCreditCard, FiSend, FiBookOpen, FiShield, FiUsers } from "react-icons/fi";
import Image from "next/image";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

import { auth, db } from "@/src/firebase/firebase";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";

// Configuração obrigatória do worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const manualData = [
  {
    title: "Benefícios e Férias",
    description: "Tudo o que você precisa saber sobre benefícios, férias e licenças.",
    slug: "beneficios-e-ferias",
    icon: <FiBriefcase size={28} />,
  },
  {
    title: "Adiantamento de Viagem",
    description: "Política e procedimentos para adiantamento de despesas de viagem.",
    slug: "adiantamento-de-viagem",
    icon: <FiSend size={28} />,
  },
  {
    title: "Solicitação de Reembolso",
    description: "Guia completo para solicitar reembolso de despesas corporativas.",
    slug: "solicitacao-de-reembolso",
    icon: <FiCreditCard size={28} />,
  },
  {
    title: "Código de Ética",
    description: "Diretrizes de conduta ética, integridade e boas práticas profissionais da empresa.",
    slug: "codigo_etica",
    icon: <FiBookOpen size={28} />,
  },
  {
    title: "POLÍTICA DE COMBATE ASSÉDIO",
    description: "Orientações para prevenção, identificação e combate a situações de assédio no ambiente de trabalho.",
    slug: "combate_assedio",
    icon: <FiShield size={28} />,
  },
  {
    title: "Responsabilidade Social",
    description: "Princípios e ações voltadas ao compromisso social, respeito às pessoas e desenvolvimento sustentável.",
    slug: "responsabilidade_social",
    icon: <FiUsers size={28} />,
  },
];

export default function ManualPage() {
  const [pdfSlug, setPdfSlug] = useState<string | null>(null);
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(800);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Estados para controle de confirmação do Firebase
  const [isConfirming, setIsConfirming] = useState(false);
  const [jaConfirmado, setJaConfirmado] = useState(false);

  const buildConfirmDocId = (uid: string, documentoSlug: string) =>
    `${uid}__${encodeURIComponent(documentoSlug)}`;

  // Recalcula largura do PDF quando modal abre/resize
  useEffect(() => {
    if (!pdfSlug) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth - 32);
      }
    };

    window.addEventListener("resize", updateWidth);

    const observer = new MutationObserver(updateWidth);
    observer.observe(document.body, { childList: true, subtree: true });

    const timeout = setTimeout(updateWidth, 100);

    return () => {
      window.removeEventListener("resize", updateWidth);
      observer.disconnect();
      clearTimeout(timeout);
    };
  }, [pdfSlug]);

  // Sempre que abrir/trocar o PDF, verifica se já confirmou no Firebase
  useEffect(() => {
    const checkConfirmacao = async () => {
      if (!pdfSlug) return;

      const user = auth.currentUser;
      if (!user) return;

      try {
        const docId = buildConfirmDocId(user.uid, pdfSlug);
        const ref = doc(db, "confirmacoesLeitura", docId);
        const snap = await getDoc(ref);
        setJaConfirmado(snap.exists());
      } catch (e) {
        console.error("Erro ao verificar confirmação:", e);
        setJaConfirmado(false);
      }
    };

    checkConfirmacao();
  }, [pdfSlug]);

  // Função para confirmar leitura e fechar modal
  const handleConfirmAccess = async () => {
    if (!pdfSlug) return;

    try {
      setIsConfirming(true);

      const user = auth.currentUser;
      if (!user) {
        alert("Sessão expirada. Faça login novamente.");
        return;
      }

      // Se já confirmou, vira apenas FECHAR (não registra novamente)
      if (jaConfirmado) {
        setPdfSlug(null);
        return;
      }

      // ID fixo => não duplica
      const confirmDocId = buildConfirmDocId(user.uid, pdfSlug);
      const confirmRef = doc(db, "confirmacoesLeitura", confirmDocId);

      // Double-check: se existir, não cria
      const existing = await getDoc(confirmRef);
      if (existing.exists()) {
        setJaConfirmado(true);
        setPdfSlug(null);
        return;
      }

      // Busca nome/email do users/{uid}
      let nome = user.displayName ?? "";
      let email = user.email ?? "";

      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data() as any;
          nome = data.nome ?? nome;
          email = data.email ?? email;
        }
      } catch (e) {
        console.warn("Não foi possível ler users/{uid}. Usando dados do Auth.", e);
      }

      // Registra uma única vez
      await setDoc(confirmRef, {
        uid: user.uid,
        nome,
        email,
        documentoSlug: pdfSlug,
        pagina: "Manual do Colaborador",
        acessadoEm: serverTimestamp(),
        userAgent: typeof window !== "undefined" ? window.navigator.userAgent : null,
        pagePath: typeof window !== "undefined" ? window.location.pathname : "",
      });

      setJaConfirmado(true);
      setPdfSlug(null);
    } catch (error) {
      console.error(error);
      alert("Não foi possível registrar o acesso. Tente novamente.");
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-between min-h-screen bg-[#F8F8F8] gap-8 p-6">
        {/* Header */}
        <div className="w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">
              Manual do <span className="text-[#AF1B1B]">Colaborador</span>
            </h1>
            <div className="w-24 h-1 bg-[#AF1B1B] mx-auto rounded"></div>
            <p className="text-[#555] mt-3">
              Conheça as políticas, normas e diretrizes que regem nosso ambiente de trabalho.
            </p>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {manualData.map((item) => (
              <Card
                key={item.slug}
                className="relative bg-white border-l-4 shadow-sm hover:shadow-xl transition-transform transform hover:-translate-y-1 rounded-md p-4 flex flex-col items-center text-center"
              >
                <div className="mb-3 text-[#AF1B1B]">{item.icon}</div>
                <CardHeader className="flex flex-col items-center justify-center space-y-2 w-full">
                  <CardTitle className="text-lg font-semibold text-[#1A1A1A]">
                    {item.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-[#555]">
                    {item.description}
                  </CardDescription>
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
                    className="px-5 py-2 bg-[#AF1B1B] text-white rounded-md cursor-pointer hover:bg-[#8C1616] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-lg"
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
          <p className="text-center text-sm text-[#7A7A7A] py-4">
            © {new Date().getFullYear()} Projeta • Sistema Interno Corporativo
          </p>
        </div>

        {/* Modal PDF com Confirmação */}
        {pdfSlug && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4">
            <div className="relative w-full max-w-7xl h-[95vh] bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
              <div ref={containerRef} className="overflow-auto p-4 flex-1 bg-white">
                <Document
                  file={`/pdfs/manual-colaborador/${pdfSlug}.pdf`}
                  onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                  loading={
                    <p className="text-center text-gray-500 mt-10">Carregando documento...</p>
                  }
                  className="flex flex-col items-center"
                >
                  {Array.from(new Array(numPages ?? 0), (_, idx) => (
                    <Page
                      key={`page_${idx + 1}`}
                      pageNumber={idx + 1}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={containerWidth}
                    />
                  ))}
                </Document>
              </div>

              {/* Card de Confirmação no Rodapé do PDF */}
              <div className="border-t bg-gray-50 p-4">
                <Card className="max-w-3xl mx-auto border-l-4 border-[#AF1B1B] shadow-sm">
                  <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {jaConfirmado ? "Documento já confirmado" : "Confirmar leitura e fechar"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {jaConfirmado
                          ? "Este documento já teve a leitura confirmada. Você pode apenas fechar."
                          : "Ao confirmar, seu acesso será registrado no monitoramento interno e o documento será fechado."}
                      </p>
                    </div>

                    <Button
                      onClick={handleConfirmAccess}
                      disabled={isConfirming}
                      className="bg-[#AF1B1B] hover:bg-[#8C1616] text-white px-6 py-2 rounded-md transition-all duration-300 hover:scale-105 disabled:opacity-60 disabled:hover:scale-100 cursor-pointer"
                    >
                      {isConfirming
                        ? "Processando..."
                        : jaConfirmado
                        ? "Fechar"
                        : "Confirmar e sair"}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Modal Dinâmico de Benefícios */}
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
                      A <span className="font-bold">Projeta</span> oferece aos colaboradores o benefício
                      de Cesta Básica, disponibilizado por meio da{" "}
                      <span className="font-bold">Plataforma Flash Benefícios</span>, garantindo
                      praticidade, transparência e autonomia na gestão dos créditos. As cestas são
                      entregues na 2ª quarta-feira de cada mês, conforme calendário interno, assegurando
                      regularidade e atendimento a todos os colaboradores elegíveis. O programa tem como
                      objetivo valorizar o bem-estar dos colaboradores, simplificar a administração dos
                      benefícios e fortalecer o vínculo entre empresa e equipe por meio de uma solução
                      moderna e digital.
                    </p>

                    <p className="text-base leading-relaxed text-[#333] text-justify">
                      O <span className="font-bold">cartão Flash</span> funciona como um cartão{" "}
                      <span className="font-semibold">pré-pago</span>, sendo aceito em diversos
                      estabelecimentos físicos e online em todo o Brasil. Ele oferece flexibilidade para o
                      colaborador escolher onde utilizar seus benefícios, dentro das categorias permitidas,
                      de forma prática e segura.
                    </p>

                    <Image
                      src="/images/beneficios/flash1.png"
                      alt="Parceiros Flash"
                      width={300}
                      height={250}
                      className="rounded-md shadow mx-auto"
                    />

                    <div className="flex flex-col items-center text-center space-y-4">
                      <h3 className="text-lg font-semibold text-[#AF1B1B]">Parceiros</h3>
                      <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-base font-medium text-[#333]">
                        <li>MC Donald's</li>
                        <li>Carrefour</li>
                        <li>Salú</li>
                        <li>Oracle</li>
                        <li>Globoplay</li>
                        <li>ePharma</li>
                        <li>Allu</li>
                        <li>ClickBus</li>
                        <li>Localiza</li>
                        <li>Insider</li>
                        <li>Americanas</li>
                        <li>Cinemark</li>
                        <li>Uber</li>
                        <li>AWS</li>
                        <li>E muito mais...</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                {/* Vale Transporte */}
                <AccordionItem value="vale-transporte">
                  <AccordionTrigger className="text-base font-semibold text-[#AF1B1B] cursor-pointer">
                    Vale Transporte
                  </AccordionTrigger>
                  <AccordionContent className="flex flex-col gap-4 text-balance">
                    <p className="text-base leading-relaxed text-[#333] text-justify">
                      Benefício concedido aos colaboradores para custeio do deslocamento residência–trabalho
                      e trabalho–residência, em conformidade com a legislação vigente (Lei nº 7.418/1985). O
                      desconto aplicado é de 6% sobre o salário base ou conforme disposto na Convenção
                      Coletiva de Trabalho aplicável à categoria. A concessão do vale-transporte visa
                      garantir o acesso regular e seguro ao local de trabalho, promovendo pontualidade e
                      assiduidade dos colaboradores.
                    </p>
                    <Image
                      src="/images/beneficios/vale_transporte.png"
                      alt="Parceiros Flash"
                      width={400}
                      height={250}
                      className="rounded-md shadow mx-auto"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Hapvida */}
                <AccordionItem value="hapvida">
                  <AccordionTrigger className="text-base font-semibold text-[#AF1B1B] cursor-pointer">
                    Plano de Saúde
                  </AccordionTrigger>
                  <AccordionContent className="pt-3 space-y-3">
                    <p className="text-base leading-relaxed text-[#333] text-justify">
                      A Projeta oferece o Plano de Saúde Hapvida, com custo compartilhado entre empresa
                      (50%) e colaborador (50%) para o titular, garantindo acesso a uma ampla rede
                      credenciada de clínicas, hospitais e laboratórios. A inclusão de dependentes é
                      opcional, sendo o custeio integral (100%) de responsabilidade do colaborador. O
                      benefício visa promover o bem-estar e a segurança dos colaboradores, proporcionando
                      atendimento médico de qualidade e incentivando o cuidado preventivo com a saúde.
                    </p>
                    <Image
                      src="/images/beneficios/hapvida_plano.png"
                      alt="Parceiros Flash"
                      width={500}
                      height={250}
                      className="rounded-md shadow mx-auto"
                    />
                  </AccordionContent>
                </AccordionItem>

                {/* Icatu */}
                <AccordionItem value="icatu">
                  <AccordionTrigger className="text-base font-semibold text-[#AF1B1B] cursor-pointer">
                    Seguro de Vida
                  </AccordionTrigger>
                  <AccordionContent className="pt-3 space-y-3">
                    <p className="text-base leading-relaxed text-[#333] text-justify">
                      A Projeta disponibiliza o Seguro de Vida Icatu Seguros a todos os colaboradores, sem
                      desconto em folha, garantindo proteção financeira em casos de falecimento, invalidez ou
                      outros eventos cobertos pela apólice. O benefício reforça o compromisso da empresa com
                      a segurança e o amparo às famílias dos colaboradores, assegurando tranquilidade e
                      suporte em situações imprevistas.
                    </p>
                    <Image
                      src="/images/beneficios/icatu_seguros_banner.jpg"
                      alt="Parceiros Flash"
                      width={800}
                      height={250}
                      className="rounded-md shadow mx-auto"
                    />
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
                        As férias constituem um direito trabalhista garantido pela Consolidação das Leis do
                        Trabalho (CLT), destinado ao descanso e à recuperação física e mental do colaborador
                        após o período de 12 meses de serviço. A política da Projeta segue integralmente a
                        legislação vigente, assegurando transparência, planejamento e conformidade em todo o
                        processo de concessão, programação e pagamento das férias.
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

                      <Image
                        src="/images/beneficios/ferias.jpg"
                        alt="Parceiros Flash"
                        width={500}
                        height={250}
                        className="rounded-md shadow mx-auto"
                      />
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
  );
}