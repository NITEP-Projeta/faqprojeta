import { faqByCategory } from "@/app/data/faq"
import FAQSection from "@/components/faq-accordion"
import CursorBall from "@/components/CursorBall"

export default function FAQPage() {
  return (
    <div className="relative min-h-screen">
      {/* Cursor customizado */}
      <CursorBall />

      {/* Hero */}
      <section className="bg-muted py-16 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">❓ Central de Dúvidas</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Encontre aqui respostas para as dúvidas mais comuns sobre os sistemas internos da Projeta.
        </p>
      </section>

      {/* Conteúdo */}
      <section className="container py-12 max-w-3xl">
        {faqByCategory.map((section, idx) => (
          <FAQSection
            key={idx}
            category={section.category}
            icon={section.icon}
            items={section.items}
          />
        ))}
      </section>
    </div>
  )
}
