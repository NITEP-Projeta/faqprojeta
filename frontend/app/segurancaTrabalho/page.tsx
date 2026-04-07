"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import SignatureCanvas from "react-signature-canvas";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  TriangleAlert,
  FileWarning,
  RotateCcw,
  Eraser,
  FileDown,
  X,
} from "lucide-react";

type DireitoRecusaFormData = {
  gerenciaArea: string;
  supervisorChefiaImediata: string;
  nomeEmpregado: string;
  matricula: string;
  empresa: string;
  localOuEquipamento: string;
  descricaoCondicaoObservada: string;
  nomeSupervisorChefia: string;
  assinaturaEmpregado: string;
  dataEmpregado: string;
};

const initialForm: DireitoRecusaFormData = {
  gerenciaArea: "",
  supervisorChefiaImediata: "",
  nomeEmpregado: "",
  matricula: "",
  empresa: "",
  localOuEquipamento: "",
  descricaoCondicaoObservada: "",
  nomeSupervisorChefia: "",
  assinaturaEmpregado: "",
  dataEmpregado: "",
};

type SignatureFieldProps = {
  label: string;
  canvasRef: React.RefObject<SignatureCanvas | null>;
  onClear: () => void;
};

function SignatureField({ label, canvasRef, onClear }: SignatureFieldProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-800">
          {label}
        </label>
        <button
          type="button"
          onClick={onClear}
          className="inline-flex items-center gap-1 text-xs text-[#AF1B1B] hover:text-[#8C1616] cursor-pointer"
        >
          <Eraser className="w-3.5 h-3.5" />
          Limpar
        </button>
      </div>

      <div className="rounded-md border border-gray-300 bg-white p-2">
        <SignatureCanvas
          ref={canvasRef}
          penColor="black"
          canvasProps={{
            className: "w-full h-36 rounded-md bg-white",
          }}
        />
      </div>
    </div>
  );
}

export default function SegurancaTrabalhoPage() {
  const [form, setForm] = useState<DireitoRecusaFormData>(initialForm);
  const [isGenerating, setIsGenerating] = useState(false);
  const [openForm, setOpenForm] = useState(false);

  const assinaturaEmpregadoRef = useRef<SignatureCanvas | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const clearSignature = (ref: React.RefObject<SignatureCanvas | null>) => {
    ref.current?.clear();
  };

  const handleReset = () => {
    setForm(initialForm);
    assinaturaEmpregadoRef.current?.clear();
  };

  const handleCloseModal = () => {
    setOpenForm(false);
  };

  const getSignatureData = (ref: React.RefObject<SignatureCanvas | null>) => {
    if (!ref.current || ref.current.isEmpty()) return "";
    return ref.current.getTrimmedCanvas().toDataURL("image/png");
  };

  const splitTextByLength = (text: string, maxChars: number) => {
    if (!text) return [];
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (testLine.length <= maxChars) {
        currentLine = testLine;
      } else {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const handleExportPdf = async () => {
    try {
      setIsGenerating(true);

      const assinatura = getSignatureData(assinaturaEmpregadoRef);

      if (
        !form.nomeEmpregado.trim() ||
        !form.matricula.trim() ||
        !form.localOuEquipamento.trim() ||
        !form.descricaoCondicaoObservada.trim() ||
        !form.dataEmpregado.trim()
      ) {
        alert(
          "Preencha os campos obrigatórios: Nome do Empregado, Matrícula, Local ou equipamento, Descrição da condição observada e Data."
        );
        return;
      }

      if (!assinatura) {
        alert("A assinatura do empregado é obrigatória para extrair o PDF.");
        return;
      }

      const existingPdfBytes = await fetch(
        "/pdfs/seguranca-trabalho/direito_de_recusa.pdf"
      ).then((res) => res.arrayBuffer());

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const page = pdfDoc.getPage(0);
      const { height } = page.getSize();

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      const drawText = (
        text: string,
        x: number,
        y: number,
        size = 9,
        bold = false
      ) => {
        page.drawText(text || "", {
          x,
          y,
          size,
          font: bold ? fontBold : font,
          color: rgb(0, 0, 0),
        });
      };

      const assinaturaBase64 = assinatura.split(",")[1];
      const assinaturaBytes = Uint8Array.from(
        atob(assinaturaBase64),
        (c) => c.charCodeAt(0)
      );
      const assinaturaImage = await pdfDoc.embedPng(assinaturaBytes);

      // BLOCO 1
      drawText(form.gerenciaArea, 40, height - 107, 9, false);
      drawText(form.supervisorChefiaImediata, 340, height - 107, 9, false);

      // BLOCO 2
      drawText(form.nomeEmpregado, 40, height - 149, 9, false);
      drawText(form.matricula, 340, height - 149, 9, false);

      // BLOCO 3
      drawText(form.empresa, 40, height - 183, 9, false);

      // BLOCO 4
      drawText(form.localOuEquipamento, 40, height - 255, 9, false);

      // BLOCO 5
      const descricaoLines = splitTextByLength(
        form.descricaoCondicaoObservada,
        88
      );

      let yDescricao = height - 310;
      descricaoLines.slice(0, 8).forEach((line) => {
        drawText(line, 40, yDescricao, 9, false);
        yDescricao -= 12;
      });

      // BLOCO 6
      drawText(form.nomeSupervisorChefia, 42, height - 405, 9, false);

      // BLOCO 7
      page.drawImage(assinaturaImage, {
        x: 160,
        y: height - 450,
        width: 75,
        height: 20,
      });

      // BLOCO 8
      drawText(form.dataEmpregado, 450, height - 440, 9, false);

      const pdfBytes = await pdfDoc.save();

      const pdfBuffer = new ArrayBuffer(pdfBytes.length);
      new Uint8Array(pdfBuffer).set(pdfBytes);

      const blob = new Blob([pdfBuffer], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `direito-de-recusa-${form.nomeEmpregado
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase()}.pdf`;
      link.click();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Não foi possível gerar o PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col items-center justify-between min-h-screen bg-[#F8F8F8] gap-8 p-6">
        {/* Header */}
        <div className="w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <TriangleAlert className="w-9 h-9 text-[#AF1B1B]" />
              <h1 className="text-4xl font-bold text-[#1A1A1A]">
                Segurança do <span className="text-[#AF1B1B]">Trabalho</span>
              </h1>
            </div>

            <div className="w-28 h-1 bg-[#AF1B1B] mx-auto rounded" />

            <p className="text-[#555] mt-3 max-w-3xl mx-auto">
              Consulte documentos e formulários relacionados à prevenção de riscos,
              registros internos e continuidade do fluxo de Segurança do Trabalho.
            </p>
          </motion.div>
        </div>

        {/* Card */}
        <div className="w-full max-w-7xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <Card className="relative bg-white border-l-4 shadow-sm hover:shadow-xl transition-transform transform hover:-translate-y-1 rounded-md p-4 flex flex-col items-center text-center">
              <div className="mb-3 text-[#AF1B1B]">
                <FileWarning className="w-8 h-8" />
              </div>

              <CardHeader className="flex flex-col items-center justify-center space-y-2 w-full">
                <CardTitle className="text-lg font-semibold text-[#1A1A1A]">
                  Direito de Recusa
                </CardTitle>
                <CardDescription className="text-sm text-[#555]">
                  Formulário para registro inicial de condição de risco grave e
                  iminente.
                </CardDescription>
              </CardHeader>

              <CardContent className="flex justify-center mt-2">
                <Button
                  onClick={() => setOpenForm(true)}
                  className="px-5 py-2 bg-[#AF1B1B] text-white rounded-md transition-all duration-300 ease-in-out hover:bg-[#8C1616] hover:scale-105 hover:shadow-lg cursor-pointer"
                >
                  Acessar
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-7xl">
          <p className="text-center text-sm text-[#7A7A7A] py-4">
            © {new Date().getFullYear()} Projeta • Sistema Interno Corporativo
          </p>
        </div>

        {/* Modal formulário */}
        {openForm && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-2 sm:p-4">
            <div className="relative w-full max-w-6xl h-[95vh] bg-white shadow-lg rounded-lg overflow-hidden flex flex-col">
              {/* Header modal */}
              <div className="border-b px-5 py-4 bg-white">
                <h2 className="text-lg font-semibold text-[#1A1A1A]">
                  Formulário de Direito de Recusa
                </h2>
                <p className="text-sm text-[#666]">
                  Preenchimento todas as etapas.
                </p>
              </div>

              {/* Conteúdo */}
              <div className="flex-1 overflow-auto bg-[#F8F8F8] px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-6xl">
                  <Card className="border-l-4 border-[#AF1B1B] shadow-sm rounded-md bg-white">
                    <CardContent className="p-6 sm:p-8">
                      <div className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900 text-sm">
                        Após o preenchimento inicial, utilize o botão{" "}
                        <span className="font-semibold">Extrair PDF</span> para gerar o
                        documento com o layout oficial.
                      </div>
                      <form
                        className="space-y-8"
                        onSubmit={(e) => e.preventDefault()}
                      >
                        <section>
                          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                            1. Identificação
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-800 mb-1">
                                Gerência de Área
                              </label>
                              <input
                                type="text"
                                name="gerenciaArea"
                                value={form.gerenciaArea}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AF1B1B]"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-800 mb-1">
                                Supervisor/Chefia Imediata
                              </label>
                              <input
                                type="text"
                                name="supervisorChefiaImediata"
                                value={form.supervisorChefiaImediata}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AF1B1B]"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-800 mb-1">
                                Nome do Empregado *
                              </label>
                              <input
                                type="text"
                                name="nomeEmpregado"
                                value={form.nomeEmpregado}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AF1B1B]"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-800 mb-1">
                                Matrícula *
                              </label>
                              <input
                                type="text"
                                name="matricula"
                                value={form.matricula}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AF1B1B]"
                              />
                            </div>
                          </div>

                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-800 mb-1">
                              Empresa
                            </label>
                            <input
                              type="text"
                              name="empresa"
                              value={form.empresa}
                              onChange={handleChange}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AF1B1B]"
                            />
                          </div>
                        </section>

                        <section>
                          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                            2. Declaração
                          </h3>

                          <div className="rounded-md border border-gray-200 bg-gray-50 px-4 py-4 text-sm text-gray-800 leading-relaxed">
                            “Conforme análise da condição de trabalho, verifiquei uma
                            condição de risco grave e iminente para minha segurança e
                            saúde e/ou de terceiros, paralisando temporariamente as
                            minhas atividades até que as correções sejam
                            implementadas”.
                          </div>
                        </section>

                        <section>
                          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                            3. Registro da Ocorrência
                          </h3>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-800 mb-1">
                                Local ou equipamento *
                              </label>
                              <input
                                type="text"
                                name="localOuEquipamento"
                                value={form.localOuEquipamento}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AF1B1B]"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-800 mb-1">
                                Descrição da condição observada *
                              </label>
                              <textarea
                                name="descricaoCondicaoObservada"
                                value={form.descricaoCondicaoObservada}
                                onChange={handleChange}
                                rows={6}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AF1B1B]"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-800 mb-1">
                                Nome do supervisor/chefia imediata
                              </label>
                              <input
                                type="text"
                                name="nomeSupervisorChefia"
                                value={form.nomeSupervisorChefia}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AF1B1B]"
                              />
                            </div>
                          </div>
                        </section>

                        <section>
                          <h3 className="text-lg font-semibold text-[#1A1A1A] mb-4">
                            4. Confirmação do Empregado
                          </h3>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                            <SignatureField
                              label="Assinatura do empregado *"
                              canvasRef={assinaturaEmpregadoRef}
                              onClear={() => clearSignature(assinaturaEmpregadoRef)}
                            />

                            <div>
                              <label className="block text-sm font-medium text-gray-800 mb-1">
                                Data *
                              </label>
                              <input
                                type="date"
                                name="dataEmpregado"
                                value={form.dataEmpregado}
                                onChange={handleChange}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#AF1B1B]"
                              />
                            </div>
                          </div>
                        </section>

                        <section className="rounded-md bg-gray-50 border border-gray-200 px-4 py-4 text-sm text-gray-700">
                          <p className="font-semibold mb-2">Próximo passo</p>
                          <p>
                            Ao extrair o PDF, o documento será gerado com o layout
                            oficial completo, mantendo os campos do gerente e das
                            demais assinaturas em branco para preenchimento posterior.
                          </p>
                        </section>

                        <div className="flex flex-col sm:flex-row gap-3 justify-end">
                          <Button
                            type="button"
                            onClick={handleReset}
                            variant="outline"
                            className="border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Limpar formulário
                          </Button>

                          <Button
                            type="button"
                            onClick={handleExportPdf}
                            disabled={isGenerating}
                            className="bg-[#AF1B1B] hover:bg-[#8C1616] text-white cursor-pointer"
                          >
                            <FileDown className="w-4 h-4 mr-2" />
                            {isGenerating ? "Gerando PDF..." : "Extrair PDF"}
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Fechar modal */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 bg-[#AF1B1B] hover:bg-[#8C1616] text-white p-2 rounded-full shadow-md transition-all duration-300 cursor-pointer"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}