"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import * as Icons from "lucide-react"

type Props = {
  category: string
  icon: keyof typeof Icons
  items: { question: string; answer: string }[]
}

export default function FAQSection({ category, icon, items }: Props) {
  const Icon = Icons[icon] as LucideIcon

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="mb-10"
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className="text-primary w-6 h-6" />
        <h2 className="text-xl font-semibold">{category}</h2>
      </div>

      <Accordion type="multiple" className="w-full">
        {items.map((item, i) => (
          <AccordionItem key={i} value={`faq-${category}-${i}`}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.section>
  )
}
